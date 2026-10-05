// Bygger auth mot en testdatabase og fanger kodene i stedet for å sende dem.
import { createAuth } from "@/app/auth/auth";
import { createTestDb } from "./test-db";

export function createTestAuth() {
  const db = createTestDb();
  const sentCodes: { email: string; code: string }[] = [];
  const auth = createAuth({
    db,
    secret: "test-secret-som-er-minst-trettito-tegn-lang",
    baseURL: "http://localhost:5173",
    sendLoginCode: async (email, code) => {
      sentCodes.push({ email, code });
    },
  });
  return { auth, db, sentCodes, lastCode: () => sentCodes.at(-1)?.code };
}
