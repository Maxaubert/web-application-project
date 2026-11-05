// Grense per e-postadresse (Max 05.10): maks 5 koder per time og minst 60 s mellom koder.
// better-auth sin egen grense teller per IP, så denne teller vi selv i databasen.
import type { Db } from "@/db/types";
import { createAuthRepository } from "./repository";

export const CODES_PER_HOUR = 5;
export const COOLDOWN_MS = 60_000;
const HOUR_MS = 60 * 60_000;

export class CodeLimitError extends Error {
  constructor(public readonly reason: "cooldown" | "hourly") {
    super(
      reason === "cooldown"
        ? "Vent ett minutt før du ber om en ny kode."
        : "Du har bedt om for mange koder. Prøv igjen om en time.",
    );
  }
}

export async function hashEmail(email: string): Promise<string> {
  const bytes = new TextEncoder().encode(email.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function checkAndRecordCodeRequest(db: Db, email: string, now = new Date()): Promise<void> {
  const emailHash = await hashEmail(email);
  const repository = createAuthRepository(db);
  const recent = await repository.findCodeRequestsSince(emailHash, new Date(now.getTime() - HOUR_MS));

  if (recent.some((createdAt) => createdAt.getTime() > now.getTime() - COOLDOWN_MS)) throw new CodeLimitError("cooldown");
  if (recent.length >= CODES_PER_HOUR) throw new CodeLimitError("hourly");

  await repository.recordCodeRequest(emailHash, now);
}
