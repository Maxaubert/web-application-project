// Validering av skjemadata på serveren med Zod (React-kurset leksjon 16 og 19).
// TypeScript forsvinner ved kjøring; disse sjekkene gjør det ikke.
import { z } from "zod";
import { CODE_LENGTH } from "./constants";
import { isHiofEmail, normalizeEmail } from "./hiof-email";
import { isSupportedCountry, toE164 } from "./phone";

export const emailSchema = z
  .string({ error: "Skriv inn e-postadressen din." })
  .transform(normalizeEmail)
  .refine(isHiofEmail, { message: "Bruk HiØ-e-posten din (@hiof.no)." });

export const codeSchema = z
  .string({ error: "Skriv inn koden fra e-posten." })
  .transform((value) => value.replace(/\s/g, ""))
  .refine((value) => value.length === CODE_LENGTH && /^[0-9]+$/.test(value), {
    message: `Koden har ${CODE_LENGTH} sifre.`,
  });

export const accountSchema = z
  .object({
    name: z
      .string({ error: "Skriv inn fullt navn." })
      .trim()
      .min(2, { error: "Skriv inn fullt navn." })
      .max(100, { error: "Navnet kan ha maks 100 tegn." }),
    country: z.string().refine(isSupportedCountry, { message: "Velg et land." }),
    phone: z.string({ error: "Skriv inn telefonnummeret ditt." }).trim(),
  })
  .transform((data, ctx) => {
    const phone = isSupportedCountry(data.country) ? toE164(data.phone, data.country) : null;
    if (!phone) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Telefonnummeret er ikke gyldig for landet du valgte." });
      return z.NEVER;
    }
    return { name: data.name, phone };
  });

// Første feilmelding per felt, til visning ved feltet.
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    result[key] ??= issue.message;
  }
  return result;
}
