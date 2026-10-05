// Den ene funksjonen som leverer innloggingskoden. Ekte e-post kommer i issue #46.
// Lokalt (LOGIN_CODE_DELIVERY=log i .dev.vars) skrives koden til terminalen. Ellers feiler
// sendingen, så en kode aldri havner i en produksjonslogg ved et uhell.
import type { SendLoginCode } from "./auth";

export const printLoginCode: SendLoginCode = async (email, code) => {
  console.log(`\n  Innloggingskode til ${email}: ${code}  (bare lokal utvikling)\n`);
};

export const emailNotConfigured: SendLoginCode = async () => {
  throw new Error("E-postutsending er ikke satt opp ennå (issue #46).");
};
