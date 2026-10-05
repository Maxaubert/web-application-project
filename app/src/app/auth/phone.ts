// Telefon med land (Max 05.10): nummeret må være gyldig for landet som er valgt i nedtrekkslisten.
// libphonenumber-js/min sjekker lengde og format per land. Lagres som E.164, f.eks. +4791234567.
import { getCountries, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/min";

export const DEFAULT_COUNTRY: CountryCode = "NO";
const supported = new Set<string>(getCountries());

export function isSupportedCountry(value: unknown): value is CountryCode {
  return typeof value === "string" && supported.has(value);
}

export function toE164(raw: string, country: CountryCode): string | null {
  const parsed = parsePhoneNumberFromString(raw, country);
  if (!parsed || !parsed.isValid() || parsed.country !== country) return null;
  return parsed.number;
}

// Land for nedtrekkslisten: Norge først, resten sortert etter norsk navn.
export function countryOptions(): { code: CountryCode; name: string }[] {
  const names = new Intl.DisplayNames(["nb"], { type: "region" });
  const all = getCountries().map((code) => ({ code, name: names.of(code) ?? code }));
  const norway = all.filter((c) => c.code === DEFAULT_COUNTRY);
  const rest = all.filter((c) => c.code !== DEFAULT_COUNTRY).sort((a, b) => a.name.localeCompare(b.name, "nb"));
  return [...norway, ...rest];
}
