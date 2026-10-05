// E-posten mellom de to innloggingsstegene ligger i en kortlivet, HttpOnly cookie,
// ikke i adressefeltet, der den ville havnet i nettleserhistorikk og logger.
export const PENDING_EMAIL_COOKIE = "login_email";
const MAX_AGE_SECONDS = 10 * 60;

function cookie(value: string, maxAge: number, secure: boolean): string {
  return `${PENDING_EMAIL_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

export function setPendingEmailCookie(email: string, secure: boolean): string {
  return cookie(email, MAX_AGE_SECONDS, secure);
}

export function clearPendingEmailCookie(secure: boolean): string {
  return cookie("", 0, secure);
}

export function readPendingEmail(headers: Headers): string | null {
  for (const part of (headers.get("cookie") ?? "").split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === PENDING_EMAIL_COOKIE) return decodeURIComponent(rest.join("=")) || null;
  }
  return null;
}
