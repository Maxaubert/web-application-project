// Lokal innloggingssnarvei (Max 10.10, #106, endrer beslutningen fra 05.10): /dev/login logger inn
// seed-brukeren med den ekte kodeflyten, så ingen interne better-auth-deler omgås. Finnes bare under
// npm run dev: worker.tsx registrerer ikke ruten i produksjonsbygget (lås nr. 1), og handleren gir
// 404 uten import.meta.env.DEV (lås nr. 2). Kodegrensen per adresse gjelder fortsatt.
import type { RequestInfo } from "rwsdk/worker";
import { getAuth } from "./instance";
import { getDevCode } from "./send-login-code";

export const DEV_LOGIN_EMAIL = "test.testesen@hiof.no";

export async function devLogin({ request }: RequestInfo) {
  if (!import.meta.env.DEV) return new Response("Not Found", { status: 404 });

  const auth = getAuth();
  await auth.api.sendVerificationOTP({ body: { email: DEV_LOGIN_EMAIL, type: "sign-in" }, headers: request.headers });
  const otp = getDevCode(DEV_LOGIN_EMAIL);
  if (!otp) return new Response("Ingen kode. Står LOGIN_CODE_DELIVERY=log i .dev.vars?", { status: 500 });

  const result = await auth.api.signInEmailOTP({
    body: { email: DEV_LOGIN_EMAIL, otp },
    headers: request.headers,
    returnHeaders: true,
  });
  const headers = new Headers(result.headers);
  headers.set("Location", "/");
  return new Response(null, { status: 302, headers });
}
