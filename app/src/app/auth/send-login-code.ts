// Den ene funksjonen som leverer innloggingskoden. Ekte e-post kommer i issue #46.
// Lokalt (LOGIN_CODE_DELIVERY=log i .dev.vars) skrives koden til terminalen. Ellers feiler
// sendingen, så en kode aldri havner i en produksjonslogg ved et uhell.
import type { SendLoginCode } from "./auth";

// Bare lokal utvikling (Max 05.10): siste kode per adresse, så kodesiden kan vise den i
// nettleserkonsollen. Fylles bare av printLoginCode; i produksjon er den alltid tom.
const devCodes = new Map<string, string>();

export const printLoginCode: SendLoginCode = async (email, code) => {
  devCodes.set(email.toLowerCase(), code);
  console.log(`\n  Innloggingskode til ${email}: ${code}  (bare lokal utvikling)\n`);
};

export const emailNotConfigured: SendLoginCode = async () => {
  throw new Error("E-postutsending er ikke satt opp ennå (issue #46).");
};

// Lås nummer to: koden når nettleseren bare under utviklingsserveren (npm run dev). Vite setter
// import.meta.env.DEV ved bygging, så et produksjonsbygg kan aldri slå dette på via en innstilling.
export function getDevCode(email: string): string | undefined {
  if (!import.meta.env.DEV) return undefined;
  return devCodes.get(email.toLowerCase());
}
