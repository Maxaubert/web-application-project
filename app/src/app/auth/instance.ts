// Appens auth-instans: D1-databasen og innstillinger fra Cloudflare-miljøet.
import { env } from "cloudflare:workers";
import { db } from "@/db";
import { createAuth, type Auth, type SendLoginCode } from "./auth";
import { createResendSender, emailNotConfigured, printLoginCode } from "./send-login-code";

let auth: Auth | undefined;

export function getAuth(): Auth {
  if (!env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET mangler. Kjør npm run dev, som lager .dev.vars lokalt.");
  }
  auth ??= createAuth({
    db,
    secret: env.BETTER_AUTH_SECRET,
    sendLoginCode: chooseSender(),
  });
  return auth;
}

function chooseSender(): SendLoginCode {
  if (env.LOGIN_CODE_DELIVERY === "log") return printLoginCode;
  if (env.LOGIN_CODE_DELIVERY === "resend" && env.RESEND_API_KEY && env.EMAIL_FROM) {
    return createResendSender({ apiKey: env.RESEND_API_KEY, from: env.EMAIL_FROM });
  }
  return emailNotConfigured;
}
