// Appens auth-instans: D1-databasen og innstillinger fra Cloudflare-miljøet.
import { env } from "cloudflare:workers";
import { db } from "@/db";
import { createAuth, type Auth } from "./auth";
import { emailNotConfigured, printLoginCode } from "./send-login-code";

let auth: Auth | undefined;

export function getAuth(): Auth {
  if (!env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET mangler. Kjør npm run dev, som lager .dev.vars lokalt.");
  }
  auth ??= createAuth({
    db,
    secret: env.BETTER_AUTH_SECRET,
    sendLoginCode: env.LOGIN_CODE_DELIVERY === "log" ? printLoginCode : emailNotConfigured,
  });
  return auth;
}
