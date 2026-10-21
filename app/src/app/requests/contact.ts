// Kontaktinfo etter godtatt forespørsel (FK-08, #188): den andre partens navn, telefon og e-post. Bare de to partene får
// den, og først fra godtatt og så lenge avtalen står (godtatt, i bruk, fullført). Før aksept, etter avslag eller
// avbestilling, og for alle andre er svaret undefined. getRequestForParty henter aldri telefon og e-post, så alt
// som deles, går gjennom denne funksjonen.
import { eq } from "drizzle-orm";
import { user } from "@/db/schema";
import type { Db } from "@/db/types";
import { getRequestForParty } from "./queries";
import type { RequestStatus } from "./request-status";

export type Contact = { name: string; email: string; phone: string | null };

const sharedStatuses: RequestStatus[] = ["accepted", "in_use", "completed"];

export async function getContactForParty(db: Db, requestId: string, userId: string, now = new Date()): Promise<Contact | undefined> {
  const details = await getRequestForParty(db, requestId, userId, now);
  if (!details || !sharedStatuses.includes(details.request.status)) return undefined;

  const otherId = details.role === "owner" ? details.request.requesterId : details.listing.ownerId;
  const rows = await db.select({ name: user.name, email: user.email, phone: user.phone }).from(user).where(eq(user.id, otherId)).limit(1);
  return rows[0];
}
