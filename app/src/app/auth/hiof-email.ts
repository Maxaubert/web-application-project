// HiØ-e-post: normalisering og domenesjekk. Serverens sjekk er den som gjelder (FK-01, AK-30).
export const HIOF_DOMAIN = "hiof.no";

export function normalizeEmail(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

export function isHiofEmail(raw: unknown): boolean {
  const email = normalizeEmail(raw);
  const at = email.lastIndexOf("@");
  if (at < 1) return false;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  return domain === HIOF_DOMAIN && /^[^\s@]+$/.test(local);
}
