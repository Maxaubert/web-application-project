// Utsendingen av e-postvarsler (#232). Samme innstilling som innloggingskodene (LOGIN_CODE_DELIVERY, Max 07.10):
// «resend» sender med Resend fra eget domene (produksjon), «log» skriver varselet til terminalen (lokalt). Alt annet feiler;
// feilen fanges i notify.ts, så et varsel aldri stopper handlingen.
import type { Message } from "./messages";

export type SendEmail = (to: string, message: Message) => Promise<void>;

const RESEND_URL = "https://api.resend.com/emails";

// Miljøet hentes først når et varsel sendes. Da kan sider og tester som bare importerer serverhandlingene, lastes uten
// Cloudflare-miljøet.
export function getEmailSender(): SendEmail {
  return async (to, { subject, text }) => {
    const { env } = await import("cloudflare:workers");
    if (env.LOGIN_CODE_DELIVERY === "log") {
      console.log(`\n  E-post til ${to}: ${subject}\n  ${text.replaceAll("\n", "\n  ")}\n`);
      return;
    }
    if (env.LOGIN_CODE_DELIVERY !== "resend" || !env.RESEND_API_KEY || !env.EMAIL_FROM) {
      throw new Error("E-postutsending er ikke satt opp (LOGIN_CODE_DELIVERY).");
    }
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM, to: [to], subject, text }),
    });
    // Feilmeldingen har bare statusen, aldri nøkkelen eller innholdet.
    if (!response.ok) throw new Error(`Resend svarte ${response.status}.`);
  };
}
