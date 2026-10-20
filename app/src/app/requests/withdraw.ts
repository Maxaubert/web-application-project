// Forespørreren trekker en ventende forespørsel tilbake (FK-04, #188), uansett hvem som har tur. Tar databasen som
// argument; serverhandlingen updateRequest i actions.ts henter brukeren fra økten og kaller hit.
import { and, eq } from "drizzle-orm";
import { request } from "@/db/schema";
import type { Db } from "@/db/types";
import { getRequestForParty } from "./queries";
import { expireIfDue } from "./request-expiry";
import { nextStatus } from "./request-status";
import type { HandoverResult } from "./handover";

export async function withdrawRequest(
  db: Db,
  { userId, requestId, now = new Date() }: { userId: string; requestId: string; now?: Date },
): Promise<HandoverResult> {
  const details = await getRequestForParty(db, requestId, userId, now);
  if (!details) return { ok: false, error: "Forespørselen finnes ikke" };
  const { request: found, role } = details;

  // Lesingen regner utløpet ut; her lagres det, og tilbaketrekkingen avvises.
  if (found.status === "expired") {
    await expireIfDue(db, requestId, now);
    return { ok: false, error: "Forespørselen er utløpt" };
  }

  const next = nextStatus(found.status, "withdraw", role);
  if (!next) return { ok: false, error: "Du kan ikke gjøre dette nå" };

  const changed = await db
    .update(request)
    .set({ status: next, updatedAt: now })
    .where(and(eq(request.id, requestId), eq(request.status, found.status)))
    .returning({ id: request.id });
  if (changed.length === 0) return { ok: false, error: "Forespørselen er endret. Last siden på nytt." };
  return { ok: true };
}
