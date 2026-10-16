// Validering av bud og perioder (FK-04). Kjøres i serverhandlingen; skjemaet i nettleseren er bare til
// hjelp. Hva et forslag inneholder, avhenger av annonsens handelstype: salg har bud, lån har periode,
// gis bort har ingenting (D-01, D-22).
import { z } from "zod";
import { fieldErrors } from "@/app/auth/schemas";
import { PRICE_MAX } from "@/app/listings/search-limits";
import type { Listing } from "@/db/schema";

// Fra- og til-dato teller begge, så 1. til 7. er en uke.
export const MIN_LOAN_DAYS = 7;
const DAY_MS = 86_400_000;

export type OfferValues = { price?: string; startDate?: string; endDate?: string };
export type OfferInput = { price: number | null; startDate: string | null; endDate: string | null };
type Validation = { success: true; data: OfferInput } | { success: false; fieldErrors: Record<string, string> };

// ÅÅÅÅ-MM-DD som en ekte dato (31. februar og 2026-13-01 gir null). Millisekunder i UTC.
function parseDay(raw: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!m) return null;
  const ms = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(ms).toISOString().slice(0, 10) === raw ? ms : null;
}

// Antall dager i perioden, begge dagene medregnet. Brukes sammen med loanPrice.
export function loanDays(startDate: string, endDate: string): number {
  const start = parseDay(startDate);
  const end = parseDay(endDate);
  if (start === null || end === null) throw new Error("Datoene må være gyldige (ÅÅÅÅ-MM-DD)");
  return Math.round((end - start) / DAY_MS) + 1;
}

const bidSchema = z.object({
  price: z
    .string()
    .trim()
    .min(1, "Skriv et bud")
    .regex(/^\d+$/, "Bud må være et helt tall, for eksempel 250")
    .transform(Number)
    .pipe(z.number().max(PRICE_MAX, "Bud kan være høyst 100 000 kr")),
});

const day = (missing: string) =>
  z
    .string()
    .trim()
    .min(1, missing)
    .refine((value) => parseDay(value) !== null, "Skriv datoen som ÅÅÅÅ-MM-DD");

// Zod kjører en refine også når en dato er ugyldig, så periodekontrollene hopper over det tilfellet
// selv (da har feltet allerede fått sin egen feil).
function periodDays(p: { startDate: string; endDate: string }): number | null {
  const start = parseDay(p.startDate);
  const end = parseDay(p.endDate);
  return start === null || end === null ? null : loanDays(p.startDate, p.endDate);
}

const periodSchema = z
  .object({ startDate: day("Velg fra-dato"), endDate: day("Velg til-dato") })
  .superRefine((p, ctx) => {
    const days = periodDays(p);
    if (days === null) return;
    if (days < 1) ctx.addIssue({ code: "custom", message: "Til-dato kan ikke være før fra-dato", path: ["endDate"] });
    else if (days < MIN_LOAN_DAYS) ctx.addIssue({ code: "custom", message: "Lånet må vare minst én uke", path: ["endDate"] });
  });

// Felt som ikke hører til handelstypen skal ikke være med i det hele tatt.
function unusedFields(values: OfferValues, keys: (keyof OfferValues)[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const key of keys) {
    if ((values[key] ?? "").trim() !== "") errors[key] = "Feltet gjelder ikke denne annonsetypen";
  }
  return errors;
}

export function validateOffer(type: Listing["type"], values: OfferValues): Validation {
  if (type === "sale") {
    const errors = unusedFields(values, ["startDate", "endDate"]);
    const parsed = bidSchema.safeParse({ price: values.price ?? "" });
    if (!parsed.success) Object.assign(errors, fieldErrors(parsed.error));
    if (!parsed.success || Object.keys(errors).length > 0) return { success: false, fieldErrors: errors };
    return { success: true, data: { price: parsed.data.price, startDate: null, endDate: null } };
  }

  if (type === "loan") {
    const errors = unusedFields(values, ["price"]);
    const parsed = periodSchema.safeParse({ startDate: values.startDate ?? "", endDate: values.endDate ?? "" });
    if (!parsed.success) Object.assign(errors, fieldErrors(parsed.error));
    if (!parsed.success || Object.keys(errors).length > 0) return { success: false, fieldErrors: errors };
    return { success: true, data: { price: null, ...parsed.data } };
  }

  const errors = unusedFields(values, ["price", "startDate", "endDate"]);
  if (Object.keys(errors).length > 0) return { success: false, fieldErrors: errors };
  return { success: true, data: { price: null, startDate: null, endDate: null } };
}
