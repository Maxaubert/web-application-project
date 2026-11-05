// Etter godtatt forespørsel (FK-08, #188): hver part bekrefter overleveringen, og begge kan avbestille før den er bekreftet av
// begge. Tar databasen som argument og vet ingenting om økt eller nettforespørsel; serverhandlingen updateRequest i
// actions.ts henter brukeren fra økten og kaller hit. All autorisasjon ligger her.
import type { Db } from "@/db/types";
import { settleHandover } from "./auto-confirm";
import { getRequestForParty } from "./find-requests";
import { nextStatus, statusAfterHandover } from "./request-status";
import { createRequestRepository } from "./repository";

type HandoverInput = { userId: string; requestId: string; now?: Date };
export type HandoverResult = { ok: true } | { ok: false; error: string };

const NOT_FOUND = "Forespørselen finnes ikke";
const NOT_NOW = "Du kan ikke gjøre dette nå";
const CHANGED = "Forespørselen er endret. Last siden på nytt.";
const ALREADY = "Du har allerede bekreftet overleveringen";

// Bekrefter egen side av overleveringen. Når begge har bekreftet, er salg og gis bort fullført, og lånet i bruk (D-36, D-37).
export async function confirmHandover(db: Db, { userId, requestId, now = new Date() }: HandoverInput): Promise<HandoverResult> {
  // Bare de to partene finner forespørselen; alle andre får samme svar som for en ukjent id.
  const details = await getRequestForParty(db, requestId, userId, now);
  if (!details) return { ok: false, error: NOT_FOUND };
  // Har den andre ikke bekreftet på 3 dager, er overleveringen allerede bekreftet (#214); det lagres før vi svarer.
  await settleHandover(db, requestId, now);
  const { request: found, listing: ad, role } = details;
  if (found.status !== "accepted") return { ok: false, error: NOT_NOW };
  if (role === "owner" ? found.ownerConfirmed : found.requesterConfirmed) return { ok: false, error: ALREADY };

  // Flagget settes bare så lenge forespørselen fortsatt er avtalt. Raden som kommer tilbake viser begge flaggene slik de
  // var da vår oppdatering gikk gjennom: av to samtidige bekreftelser ser den siste alltid at begge er satt.
  const repository = createRequestRepository(db);
  const row = await repository.confirmSide(requestId, role, now);
  if (!row) return { ok: false, error: CHANGED };

  const next = statusAfterHandover(ad.type, row.ownerConfirmed, row.requesterConfirmed);
  if (next !== "accepted") {
    // Betinget på avtalt: en avbestilling som kom imellom, vinner, og begge bekreftelsene blir stående uten virkning.
    await repository.moveStatus(requestId, "accepted", next, now);
  }
  return { ok: true };
}

// Begge parter kan avbestille før overleveringen er bekreftet av begge. Salg og gis bort legges ut igjen; et lån har aldri
// forlatt søket, og perioden blir ledig av at forespørselen ikke lenger er avtalt.
export async function cancelRequest(db: Db, { userId, requestId, now = new Date() }: HandoverInput): Promise<HandoverResult> {
  const details = await getRequestForParty(db, requestId, userId, now);
  if (!details) return { ok: false, error: NOT_FOUND };
  await settleHandover(db, requestId, now);
  const { request: found, listing: ad, role } = details;

  const next = nextStatus(found.status, "cancel", role);
  if (!next) return { ok: false, error: NOT_NOW };

  // Statusen flyttes bare hvis den fortsatt er den vi leste: to samtidige svar kan aldri begge vinne.
  const repository = createRequestRepository(db);
  if (!(await repository.moveStatus(requestId, found.status, next, now))) return { ok: false, error: CHANGED };

  // Bare en annonse som er solgt, legges ut igjen. Har eieren tatt den ned i mellomtiden, forblir den nede.
  if (ad.type !== "loan") await repository.relistIfSold(ad.id, now);
  return { ok: true };
}
