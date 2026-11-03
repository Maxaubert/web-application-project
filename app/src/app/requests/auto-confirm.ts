// Automatisk bekreftelse av overlevering (FK-08, AK-38, #214): har bare én part bekreftet, regnes den andre som bekreftet
// 3 dager senere. Mekanismen er «lat», som utløpet i request-expiry.ts: lesing regner det ut (handoverEffective), og
// skriving lagrer det (settleHandover) før den gjør noe annet. Klokken regnes fra updatedAt: en godtatt forespørsel
// skrives bare av en bekreftelse, og en avbestilling avslutter den, så updatedAt er tidspunktet for den første bekreftelsen.
import type { Listing, Request } from "@/db/schema";
import type { Db } from "@/db/types";
import { statusAfterHandover } from "./request-status";
import { createRequestRepository } from "./repository";

export const AUTO_CONFIRM_DAYS = 3;
const DAY_MS = 86_400_000;

type Handover = Pick<Request, "status" | "ownerConfirmed" | "requesterConfirmed">;

// Tilstanden slik den gjelder nå: etter 3 dager med bare én bekreftelse er begge bekreftet, og salg og gis bort er
// fullført (lån i bruk).
export function handoverEffective(found: Handover & Pick<Request, "updatedAt">, type: Listing["type"], now: Date): Handover {
  const { status, ownerConfirmed, requesterConfirmed } = found;
  if (status !== "accepted" || ownerConfirmed === requesterConfirmed) return { status, ownerConfirmed, requesterConfirmed };
  if (now.getTime() - found.updatedAt.getTime() < AUTO_CONFIRM_DAYS * DAY_MS) return { status, ownerConfirmed, requesterConfirmed };
  return { status: statusAfterHandover(type, true, true), ownerConfirmed: true, requesterConfirmed: true };
}

// Lagrer den automatiske bekreftelsen. Sant bare når dette kallet flyttet forespørselen; en parallell skriving som kom
// først (flaggene eller statusen er endret siden vi leste) gir usant, og forespørselen blir som den er.
export async function settleHandover(db: Db, requestId: string, now: Date): Promise<boolean> {
  const repository = createRequestRepository(db);
  const row = await repository.findWithListingType(requestId);
  if (!row) return false;

  const next = handoverEffective(row.request, row.type, now);
  if (next.status === row.request.status) return false;

  return repository.settleHandover(requestId, next, row.request, now);
}
