// Leverer innloggingskoden. LOGIN_CODE_DELIVERY velger hvordan (Max 07.10):
// «resend» sender e-post via Resend fra eget domene (produksjon, wrangler.jsonc),
// «log» skriver koden til terminalen (lokalt, .dev.vars). Alt annet feiler, så en kode aldri
// havner i en produksjonslogg ved et uhell.
import type { SendLoginCode } from "./auth";

// Bare lokal utvikling (Max 05.10): siste kode per adresse, så kodesiden kan vise den i
// nettleserkonsollen. Fylles bare av printLoginCode; i produksjon er den alltid tom.
const devCodes = new Map<string, string>();

export const printLoginCode: SendLoginCode = async (email, code) => {
  devCodes.set(email.toLowerCase(), code);
  console.log(`\n  Innloggingskode til ${email}: ${code}  (bare lokal utvikling)\n`);
};

export const emailNotConfigured: SendLoginCode = async () => {
  throw new Error("E-postutsending er ikke satt opp (LOGIN_CODE_DELIVERY).");
};

const RESEND_URL = "https://api.resend.com/emails";

type ResendOptions = { apiKey: string; from: string; fetchFn?: typeof fetch };

// Sender koden med Resends HTTP-API. Nøkkelen ligger som Cloudflare-hemmelighet, aldri i koden.
export function createResendSender({ apiKey, from, fetchFn = fetch }: ResendOptions): SendLoginCode {
  return async (email, code) => {
    const text =
      `Koden din er ${code}. Den gjelder i 5 minutter.

` +
      "Har du ikke bedt om den, kan du se bort fra denne e-posten.";
    const response = await fetchFn(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Innloggingskode til Studentmarked",
        text,
        html: `<p>Koden din er <strong>${code}</strong>. Den gjelder i 5 minutter.</p>` +
          "<p>Har du ikke bedt om den, kan du se bort fra denne e-posten.</p>",
      }),
    });
    // Feilmeldingen har bare statusen, aldri nøkkelen eller koden.
    if (!response.ok) throw new Error(`Resend svarte ${response.status}.`);
  };
}

// Lås nummer to: koden når nettleseren bare under utviklingsserveren (npm run dev). Vite setter
// import.meta.env.DEV ved bygging, så et produksjonsbygg kan aldri slå dette på via en innstilling.
export function getDevCode(email: string): string | undefined {
  if (!import.meta.env.DEV) return undefined;
  return devCodes.get(email.toLowerCase());
}
