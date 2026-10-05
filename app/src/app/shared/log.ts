// Strukturert logg: én JSON-linje per hendelse. Aldri koder, tokens eller hele e-postadresser.
type Level = "info" | "warn" | "error";
type Fields = Record<string, string | number | boolean | undefined>;

export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 1) return "***";
  return `${email[0]}***${email.slice(at)}`;
}

// Cloudflare gir hver forespørsel en cf-ray-ID; lokalt finnes den ikke.
export function requestIdFrom(headers?: Headers | null): string | undefined {
  return headers?.get("cf-ray") ?? headers?.get("x-request-id") ?? undefined;
}

function write(level: Level, event: string, fields: Fields): void {
  const line = JSON.stringify({ level, event, time: new Date().toISOString(), ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  info: (event: string, fields: Fields = {}) => write("info", event, fields),
  warn: (event: string, fields: Fields = {}) => write("warn", event, fields),
  error: (event: string, fields: Fields = {}) => write("error", event, fields),
};
