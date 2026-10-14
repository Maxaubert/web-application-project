// Validering av «Legg ut annonse» (FK-03, #131). Kjøres i serverhandlingen; skjemaet i nettleseren
// er bare til hjelp. Feilmeldingene står på norsk og vises over feltet og i feilboksen.
import { z } from "zod";
import { fieldErrors } from "@/app/auth/schemas";
import { listingCategories, listingConditions, listingTypes, type Listing } from "@/db/schema";
import { PRICE_MAX } from "./search-limits";

type ListingType = Listing["type"];
type PriceResult = { value: number | null; error?: string };

// Prisen avhenger av handelstypen: salg krever pris, lån kan stå tomt (gratis), gis bort har aldri pris.
export function parsePrice(type: ListingType, raw: string): PriceResult {
  if (type === "giveaway") return { value: null };
  if (raw === "") return type === "sale" ? { value: null, error: "Skriv en pris" } : { value: null };
  if (!/^\d+$/.test(raw)) return { value: null, error: "Pris må være et helt tall, for eksempel 250" };
  const value = Number(raw);
  if (value > PRICE_MAX) return { value: null, error: "Pris kan være høyst 100 000 kr" };
  return { value };
}

const listingFields = z.object({
  title: z.string().trim().min(1, "Skriv en tittel").min(3, "Tittelen må ha minst 3 tegn").max(80, "Tittelen kan ha høyst 80 tegn"),
  description: z.string().trim().min(1, "Beskriv varen").max(2000, "Beskrivelsen kan ha høyst 2000 tegn"),
  category: z.enum(listingCategories, { error: "Velg en kategori" }),
  type: z.enum(listingTypes, { error: "Velg handelstype" }),
  condition: z.enum(listingConditions, { error: "Velg tilstand" }),
});

export type ListingFormValues = { title: string; description: string; category: string; type: string; condition: string; price: string };
export type NewListingInput = z.output<typeof listingFields> & { price: number | null };

type Validation = { success: true; data: NewListingInput } | { success: false; fieldErrors: Record<string, string> };

// Prisen sjekkes for seg, fordi Zod hopper over en refine når andre felt har feil. Da får brukeren
// alle feilene samtidig, slik feilboksen øverst i skjemaet forutsetter.
export function validateListing(values: ListingFormValues): Validation {
  const parsed = listingFields.safeParse(values);
  const errors = parsed.success ? {} : fieldErrors(parsed.error);
  const type = listingTypes.find((t) => t === values.type);
  const price = type ? parsePrice(type, values.price.trim()) : { value: null };
  if (price.error) errors.price = price.error;
  if (!parsed.success || price.error) return { success: false, fieldErrors: errors };
  return { success: true, data: { ...parsed.data, price: price.value } };
}
