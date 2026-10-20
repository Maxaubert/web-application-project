// Forretningsreglene for å svare på siste forslag (FK-05 til FK-07, #187): godta, avslå eller foreslå en ny pris.
// Tar databasen som argument og vet ingenting om økt eller nettforespørsel; serverhandlingen respondToRequest i
// actions.ts henter brukeren fra økten og kaller hit. All autorisasjon ligger her, så en skjult knapp aldri er
// det eneste som stopper et ulovlig svar.
import { and, eq, inArray, ne } from "drizzle-orm";
import { listing, offer, request } from "@/db/schema";
import type { Db } from "@/db/types";
import { getOccupiedPeriods, getWaitingPeriods, overlaps, type Period } from "./occupied";
import { validateOffer } from "./offer-rules";
import { getRequestForParty } from "./queries";
import { expireIfDue } from "./request-expiry";
import { nextStatus } from "./request-status";

export const respondActions = ["accept", "decline", "counter"] as const;
export type RespondAction = (typeof respondActions)[number];

type RespondInput = {
  userId: string;
  requestId: string;
  offerId: string;
  action: string;
  price?: string;
  startDate?: string;
  endDate?: string;
  now?: Date;
};
export type RespondResult = { ok: true } | { ok: false; error?: string; fieldErrors?: Record<string, string> };

const NOT_FOUND = "Forespørselen finnes ikke";
const EXPIRED = "Forespørselen er utløpt";
const NOT_YOUR_TURN = "Du kan ikke svare på denne forespørselen nå";
const CHANGED = "Forslaget er endret. Last siden på nytt.";
const UNAVAILABLE = "Annonsen er ikke lenger tilgjengelig";
const OVERLAP = "Perioden overlapper en opptatt periode";

function isRespondAction(action: string): action is RespondAction {
  return (respondActions as readonly string[]).includes(action);
}

// Overlapper perioden et annet godtatt eller pågående lån på annonsen? Forespørselen som svares på, regnes ikke med.
async function isTaken(db: Db, listingId: string, requestId: string, period: Period): Promise<boolean> {
  return (await getOccupiedPeriods(db, listingId, requestId)).some((taken) => overlaps(taken, period));
}

export async function respondToOffer(
  db: Db,
  { userId, requestId, offerId, action, price = "", startDate = "", endDate = "", now = new Date() }: RespondInput,
): Promise<RespondResult> {
  if (!isRespondAction(action)) return { ok: false, error: "Ukjent handling" };

  // Bare de to partene finner forespørselen; alle andre får samme svar som for en ukjent id.
  const details = await getRequestForParty(db, requestId, userId, now);
  if (!details) return { ok: false, error: NOT_FOUND };
  const { request: found, listing: ad, offers, role } = details;

  // Lesingen regner utløpet ut; her lagres det, og svaret avvises.
  if (found.status === "expired") {
    await expireIfDue(db, requestId, now);
    return { ok: false, error: EXPIRED };
  }

  const next = nextStatus(found.status, action, role);
  if (!next) return { ok: false, error: NOT_YOUR_TURN };

  // Bare siste forslag kan besvares: motparten kan ha byttet bud mens siden var åpen.
  const latest = offers[offers.length - 1];
  if (!latest || latest.id !== offerId) return { ok: false, error: CHANGED };

  // Et godtatt salg eller en godtatt gis bort tar annonsen ut av søket (D-30 til D-32); et lån lar den ligge. Annonsen
  // kreves først med en betinget oppdatering, så to aksepter på samme annonse aldri begge lykkes: den andre finner
  // den allerede solgt. (En vanlig sjekk før skriving ville latt begge passere når de kommer samtidig.)
  const takesListing = action === "accept" && ad.type !== "loan";
  if (takesListing) {
    const taken = await db
      .update(listing)
      .set({ status: "sold", updatedAt: now })
      .where(and(eq(listing.id, ad.id), eq(listing.status, "active")))
      .returning({ id: listing.id });
    if (taken.length === 0) return { ok: false, error: UNAVAILABLE };
  }

  // Et godtatt lån gjør perioden opptatt (#208). Er den allerede opptatt, avvises svaret før noe skrives.
  const period = action === "accept" && ad.type === "loan" && latest.startDate && latest.endDate ? { startDate: latest.startDate, endDate: latest.endDate } : null;
  if (period && (await isTaken(db, ad.id, requestId, period))) return { ok: false, error: OVERLAP };

  // Et motbud er et nytt forslag: ny pris for salg, ny periode for lån. Gis bort har ingenting å foreslå.
  let counterId: string | undefined;
  if (action === "counter") {
    if (ad.type === "giveaway") return { ok: false, error: "Du kan ikke sende motbud på en gis bort" };
    const validated = validateOffer(ad.type, { price, startDate, endDate });
    if (!validated.success) return { ok: false, fieldErrors: validated.fieldErrors };
    const { startDate: start, endDate: end } = validated.data;
    if (start && end && (await isTaken(db, ad.id, requestId, { startDate: start, endDate: end }))) return { ok: false, error: OVERLAP };
    // Forslaget lagres før statusen flyttes. Motparten har ikke tur før statusen er flyttet, så hen kan ikke
    // godta det gamle forslaget i mellomtiden. Motsatt rekkefølge ville gitt akkurat det vinduet.
    counterId = crypto.randomUUID();
    await db.insert(offer).values({ id: counterId, requestId, senderId: userId, ...validated.data });
  }

  // D1 har ingen transaksjoner. Statusen flyttes bare hvis den fortsatt er den vi leste, og én rad må ha endret
  // seg: to samtidige svar kan aldri begge vinne.
  const changed = await db
    .update(request)
    .set({ status: next, updatedAt: now })
    .where(and(eq(request.id, requestId), eq(request.status, found.status)))
    .returning({ id: request.id });
  if (changed.length === 0) {
    if (counterId) await db.delete(offer).where(eq(offer.id, counterId));
    // Svaret tapte, så annonsen vi nettopp tok, gis tilbake.
    if (takesListing) await db.update(listing).set({ status: "active", updatedAt: now }).where(eq(listing.id, ad.id));
    return { ok: false, error: CHANGED };
  }

  if (period) {
    // To overlappende aksepter kan ha passert sjekken over samtidig (D1 har ingen transaksjon). Nå som statusen er
    // flyttet, ser hver av dem den andre; ser en overlapp, rulles svaret tilbake. Verst kan begge feile, aldri begge lykkes.
    if (await isTaken(db, ad.id, requestId, period)) {
      await db
        .update(request)
        .set({ status: found.status, updatedAt: found.updatedAt })
        .where(and(eq(request.id, requestId), eq(request.status, next)));
      return { ok: false, error: OVERLAP };
    }
    // Ventende forespørsler på samme periode får avslag. Andre perioder, og avsluttede, røres ikke.
    const clashing = (await getWaitingPeriods(db, ad.id)).filter((other) => overlaps(other, period)).map((other) => other.requestId);
    if (clashing.length > 0) {
      await db
        .update(request)
        .set({ status: "declined", updatedAt: now })
        .where(and(inArray(request.id, clashing), inArray(request.status, ["waiting_owner", "waiting_requester"])));
    }
  }

  // De andre som venter på samme annonse får avslag. Allerede avsluttede og godtatte røres ikke.
  if (takesListing) {
    await db
      .update(request)
      .set({ status: "declined", updatedAt: now })
      .where(and(eq(request.listingId, ad.id), ne(request.id, requestId), inArray(request.status, ["waiting_owner", "waiting_requester"])));
  }
  return { ok: true };
}
