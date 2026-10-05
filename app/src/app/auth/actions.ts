"use server";
// Serverhandlingene for innlogging (React-kurset leksjon 19 og 20). Alt valideres her på
// serveren; skjemaene i nettleseren er bare til hjelp.
import { eq } from "drizzle-orm";
import { getRequestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { user } from "@/db/schema";
import { log, maskEmail, requestIdFrom } from "@/app/shared/log";
import { getAuth } from "./instance";
import { clearPendingEmailCookie, readPendingEmail, setPendingEmailCookie } from "./pending-email";
import { accountSchema, codeSchema, emailSchema, fieldErrors } from "./schemas";
import { redirect, type ActionResult } from "./form-state";

function errorMessage(error: unknown, fallback: string): string {
  const body = (error as { body?: { message?: string; code?: string } })?.body;
  switch (body?.code) {
    case "INVALID_OTP":
      return "Feil kode. Sjekk e-posten og prøv igjen.";
    case "OTP_EXPIRED":
      return "Koden har utløpt. Be om en ny kode.";
    case "TOO_MANY_ATTEMPTS":
      return "For mange feil forsøk. Be om en ny kode.";
  }
  return body?.message ?? fallback;
}

async function sendCode(email: string): Promise<string | undefined> {
  const { request } = getRequestInfo();
  const requestId = requestIdFrom(request.headers);
  try {
    await getAuth().api.sendVerificationOTP({ body: { email, type: "sign-in" }, headers: request.headers });
    log.info("code_sent", { email: maskEmail(email), requestId });
    return undefined;
  } catch (error) {
    log.warn("code_send_failed", { email: maskEmail(email), requestId });
    return errorMessage(error, "Kunne ikke sende koden. Prøv igjen litt senere.");
  }
}

export async function requestCode(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const raw = String(formData.get("email") ?? "");
  const parsed = emailSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: { email: parsed.error.issues[0].message }, values: { email: raw } };

  const error = await sendCode(parsed.data);
  if (error) return { fieldErrors: { email: error }, values: { email: raw } };

  const { request, response } = getRequestInfo();
  const secure = new URL(request.url).protocol === "https:";
  response.headers.append("Set-Cookie", setPendingEmailCookie(parsed.data, secure));
  return redirect("/login/code");
}

export async function resendCode(): Promise<ActionResult> {
  const { request } = getRequestInfo();
  const email = readPendingEmail(request.headers);
  if (!email) {
    return redirect("/login");
  }
  const error = await sendCode(email);
  return error ? { error } : {};
}

export async function verifyCode(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { request, response } = getRequestInfo();
  const email = readPendingEmail(request.headers);
  if (!email) {
    return redirect("/login");
  }
  const parsed = codeSchema.safeParse(formData.get("code"));
  if (!parsed.success) return { fieldErrors: { code: parsed.error.issues[0].message } };

  const requestId = requestIdFrom(request.headers);
  try {
    // better-auth lager økten og gir oss Set-Cookie-headerne; de må kopieres til svaret selv.
    const { headers } = await getAuth().api.signInEmailOTP({
      body: { email, otp: parsed.data },
      headers: request.headers,
      returnHeaders: true,
    });
    for (const [key, value] of headers.entries()) response.headers.append(key, value);
  } catch (error) {
    log.warn("code_failed", { email: maskEmail(email), requestId });
    return { fieldErrors: { code: errorMessage(error, "Kunne ikke logge inn. Prøv igjen.") } };
  }

  log.info("login_ok", { email: maskEmail(email), requestId });
  const secure = new URL(request.url).protocol === "https:";
  response.headers.append("Set-Cookie", clearPendingEmailCookie(secure));
  // Ny bruker uten telefon sendes videre til kontooppsettet av requireUser.
  return redirect("/");
}

export async function completeAccount(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx } = getRequestInfo();
  if (!ctx.session.isAuthenticated || !ctx.session.userId) {
    return redirect("/login");
  }
  const values = {
    name: String(formData.get("name") ?? ""),
    country: String(formData.get("country") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  };
  const parsed = accountSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  // Brukeren kan bare endre sin egen konto: ID-en kommer fra økten, aldri fra skjemaet.
  await db
    .update(user)
    .set({ name: parsed.data.name, phone: parsed.data.phone, updatedAt: new Date() })
    .where(eq(user.id, ctx.session.userId));
  log.info("account_completed", { userId: ctx.session.userId });
  return redirect("/");
}

export async function logout(): Promise<ActionResult> {
  const { request, response, ctx } = getRequestInfo();
  // signOut sletter økten i databasen, ikke bare cookien.
  const { headers } = await getAuth().api.signOut({ headers: request.headers, returnHeaders: true });
  for (const [key, value] of headers.entries()) response.headers.append(key, value);
  log.info("logout", { userId: ctx.session.userId ?? undefined });
  return redirect("/login");
}
