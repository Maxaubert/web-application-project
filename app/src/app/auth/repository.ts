// Det eneste stedet i innloggingen vår som leser og skriver i databasen selv (#256), etter Marius' repository-mønster.
// better-auth har sine egne tabeller (user, session, account, verification) og snakker med dem gjennom adapteren i
// auth.ts; dette er bare det vi har lagt til: kodegrensen og kontooppsettet.
import { and, eq, gt } from "drizzle-orm";
import { loginCodeRequest, user } from "@/db/schema";
import type { Db } from "@/db/types";

export interface AuthRepository {
  findCodeRequestsSince(emailHash: string, since: Date): Promise<Date[]>;
  recordCodeRequest(emailHash: string, now: Date): Promise<void>;
  completeAccount(userId: string, name: string, phone: string, now: Date): Promise<void>;
}

export function createAuthRepository(db: Db): AuthRepository {
  return {
    // Tidspunktene for kodene som er bedt om for adressen etter since. Adressen lagres bare som hash.
    async findCodeRequestsSince(emailHash, since) {
      const rows = await db
        .select({ createdAt: loginCodeRequest.createdAt })
        .from(loginCodeRequest)
        .where(and(eq(loginCodeRequest.emailHash, emailHash), gt(loginCodeRequest.createdAt, since)));
      return rows.map((row) => row.createdAt);
    },

    async recordCodeRequest(emailHash, now) {
      await db.insert(loginCodeRequest).values({ emailHash, createdAt: now });
    },

    // Brukeren kan bare endre sin egen konto: actionen sender alltid id-en fra økten, aldri fra skjemaet.
    async completeAccount(userId, name, phone, now) {
      await db.update(user).set({ name, phone, updatedAt: now }).where(eq(user.id, userId));
    },
  };
}
