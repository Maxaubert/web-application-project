// better-auth-oppsettet for innlogging med engangskode (FK-01, TK-01). Valgene er Max' fra 05.10:
// bare kode (ingen lenke), 6 sifre, 5 min, 3 forsøk, 5 koder per adresse per time, økt i 30 dager.
// Fabrikken tar databasen og sendefunksjonen inn, så testene kan bruke SQLite i minnet.
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { emailOTP } from "better-auth/plugins";
import * as schema from "@/db/schema";
import type { Db } from "@/db/types";
import { log, maskEmail, requestIdFrom } from "@/app/shared/log";
import { checkAndRecordCodeRequest, CodeLimitError } from "./code-limits";
import { CODE_ATTEMPTS, CODE_LENGTH, CODE_TTL_SECONDS, SESSION_SECONDS } from "./constants";
import { isHiofEmail, normalizeEmail } from "./hiof-email";

const DAY_SECONDS = 60 * 60 * 24;

export type SendLoginCode = (email: string, code: string) => Promise<void>;

export type AuthOptions = {
  db: Db;
  secret: string;
  // Utelates lokalt: better-auth leser adressen fra forespørselen. Settes ved deploy.
  baseURL?: string;
  sendLoginCode: SendLoginCode;
};

const SEND_CODE_PATH = "/email-otp/send-verification-otp";

export function createAuth({ db, secret, baseURL, sendLoginCode }: AuthOptions) {
  return betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    secret,
    baseURL,
    session: { expiresIn: SESSION_SECONDS, updateAge: DAY_SECONDS },
    user: {
      // Telefon settes bare av vårt kontooppsett, aldri fra input til better-auth sine endepunkter.
      additionalFields: { phone: { type: "string", required: false, input: false } },
    },
    rateLimit: { enabled: true, storage: "database" },
    plugins: [
      emailOTP({
        otpLength: CODE_LENGTH,
        expiresIn: CODE_TTL_SECONDS,
        allowedAttempts: CODE_ATTEMPTS,
        storeOTP: "hashed",
        async sendVerificationOTP({ email, otp }) {
          await sendLoginCode(email, otp);
        },
      }),
    ],
    hooks: {
      // Kjører før alle better-auth-endepunkter, også når noen kaller /api/auth/* direkte
      // uten å gå via skjemaene våre.
      before: createAuthMiddleware(async (ctx) => {
        const body = ctx.body as { email?: unknown; type?: unknown } | undefined;
        if (body?.email === undefined) return;
        const requestId = requestIdFrom(ctx.headers);

        if (!isHiofEmail(body.email)) {
          log.warn("login_rejected_domain", { requestId });
          throw new APIError("BAD_REQUEST", { message: "Bruk HiØ-e-posten din (@hiof.no)." });
        }
        if (ctx.path !== SEND_CODE_PATH) return;

        if (body.type !== "sign-in") {
          throw new APIError("BAD_REQUEST", { message: "Bare innlogging med kode er støttet." });
        }
        const email = normalizeEmail(body.email);
        try {
          await checkAndRecordCodeRequest(db, email);
        } catch (error) {
          if (!(error instanceof CodeLimitError)) throw error;
          log.warn("code_rate_limited", { email: maskEmail(email), reason: error.reason, requestId });
          throw new APIError("TOO_MANY_REQUESTS", { message: error.message });
        }
      }),
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
