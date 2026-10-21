// Bekreftet retur ved lån (FK-07, #214): bare eieren, bare mens lånet er i bruk, når som helst (Max 21.10). Bekreftelsen
// fullfører lånet, og perioden blir ledig av at forespørselen ikke lenger er i bruk. Samme rolle som handover.ts:
// serverhandlingen updateRequest i actions.ts henter brukeren fra økten og kaller hit.
import { and, eq } from "drizzle-orm";
import { request } from "@/db/schema";
import type { Db } from "@/db/types";
import { settleHandover } from "./auto-confirm";
import { getRequestForParty } from "./queries";
import { nextStatus } from "./request-status";
import type { HandoverResult } from "./handover";

const NOT_FOUND = "Forespørselen finnes ikke";
const NOT_NOW = "Du kan ikke gjøre dette nå";
const CHANGED = "Forespørselen er endret. Last siden på nytt.";

export async function confirmReturn(
  db: Db,
  { userId, requestId, now = new Date() }: { userId: string; requestId: string; now?: Date },
): Promise<HandoverResult> {
  // Bare de to partene finner forespørselen; alle andre får samme svar som for en ukjent id.
  const details = await getRequestForParty(db, requestId, userId, now);
  if (!details) return { ok: false, error: NOT_FOUND };

  // Et lån som ble i bruk av den automatiske bekreftelsen, er ennå ikke lagret som det.
  await settleHandover(db, requestId, now);

  const next = nextStatus(details.request.status, "confirm_return", details.role);
  if (!next) return { ok: false, error: NOT_NOW };

  const changed = await db
    .update(request)
    .set({ status: next, updatedAt: now })
    .where(and(eq(request.id, requestId), eq(request.status, "in_use")))
    .returning({ id: request.id });
  return changed.length > 0 ? { ok: true } : { ok: false, error: CHANGED };
}
