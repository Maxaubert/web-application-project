// Profilen som vises på Min side (#193). Tar databasen som argument, så testene kan bruke SQLite i minnet.
import { eq } from "drizzle-orm";
import { user } from "@/db/schema";
import type { Db } from "@/db/types";

export type Profile = { name: string; email: string; phone: string | null };

// Bare den innloggedes egen rad; siden sender alltid sin egen userId, aldri en id fra adressen.
export async function getProfile(db: Db, userId: string): Promise<Profile | undefined> {
  const rows = await db.select({ name: user.name, email: user.email, phone: user.phone }).from(user).where(eq(user.id, userId)).limit(1);
  return rows[0];
}
