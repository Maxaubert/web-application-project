// Forretningsreglene for å svare på siste forslag (FK-05 til FK-07, #187): godta, avslå eller foreslå en ny pris.
// Tar databasen som argument og vet ingenting om økt eller nettforespørsel; serverhandlingen respondToRequest i
// actions.ts henter brukeren fra økten og kaller hit. All autorisasjon ligger her, så en skjult knapp aldri er
// det eneste som stopper et ulovlig svar.
import { and, eq, inArray, ne } from "drizzle-orm";
import { offer, request } from "@/db/schema";
import type { Db } from "@/db/types";
import { validateOffer } from "./offer-rules";
import { getRequestForParty } from "./queries";
import { expireIfDue } from "./request-expiry";
import { nextStatus } from "./request-status";

export const respondActions = ["accept", "decline", "counter"] as const;
export type RespondAction = (typeof respondActions)[number];

type RespondInput = { userId: string; requestId: string; offerId: string; action: string; price?: string; now?: Date };
export type RespondResult = { ok: true } | { ok: false; error?: string; fieldErrors?: Record<string, string> };

const NOT_FOUND = "Forespørselen finnes ikke";
const EXPIRED = "Forespørselen er utløpt";
const NOT_YOUR_TURN = "Du kan ikke svare på denne forespørselen nå";
const CHANGED = "Forslaget er endret. Last siden på nytt.";
const ALREADY_ACCEPTED = "Du har allerede godtatt et annet bud på denne annonsen";

function isRespondAction(action: string): action is RespondAction {
  return (respondActions as readonly string[]).includes(action);
}

export async function respondToOffer(
  db: Db,
  { userId, requestId, offerId, action, price = "", now = new Date() }: RespondInput,
): Promise<RespondResult> {
  if (!isRespondAction(action)) return { ok: false, error: "Ukjent handling" };

  // Bare de to partene finner forespørselen; alle andre får samme svar som for en ukjent id.
  const details = await getRequestForParty(db, requestId, userId, now);
  if (!details) return { ok: false, error: NOT_FOUND };
  const { request: found, listing, offers, role } = details;

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

  if (action === "accept" && listing.type === "sale") {
    const others = await db
      .select({ id: request.id })
      .from(request)
      .where(and(eq(request.listingId, listing.id), ne(request.id, requestId), inArray(request.status, ["accepted", "in_use"])))
      .limit(1);
    if (others.length > 0) return { ok: false, error: ALREADY_ACCEPTED };
  }

  // Et motbud er et nytt forslag med ny pris. Lån og gis bort har ikke forespørsler ennå (#186), så bare salg.
  let counterId: string | undefined;
  if (action === "counter") {
    const validated = validateOffer("sale", { price });
    if (!validated.success) return { ok: false, fieldErrors: validated.fieldErrors };
    // Forslaget lagres før statusen flyttes. Motparten har ikke tur før statusen er flyttet, så hen kan ikke
    // godta det gamle forslaget i mellomtiden. Motsatt rekkefølge ville gitt akkurat det vinduet.
    counterId = crypto.randomUUID();
    await db.insert(offer).values({ id: counterId, requestId, senderId: userId, price: validated.data.price });
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
    return { ok: false, error: CHANGED };
  }
  return { ok: true };
}
