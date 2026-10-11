// Skjemaets verdier som en annonse, så forhåndsvisningen kan bruke selve annonsesiden (#171). Ingenting valideres her:
// tomme felt blir tomme, tittelen får plassholderen «Tittel», og ugyldig pris regnes som ingen pris.
import { listingTypes, type Listing } from "@/db/schema";
import type { ListingFormValues } from "./listing-schema";

export function draftListing(values: ListingFormValues): Listing {
  const type = listingTypes.find((t) => t === values.type) ?? "sale";
  const price = type !== "giveaway" && /^\d+$/.test(values.price.trim()) ? Number(values.price.trim()) : null;

  return {
    id: "utkast",
    ownerId: "",
    type,
    title: values.title.trim() || "Tittel",
    description: values.description.trim(),
    // Ikke valgt ennå er tom streng, som bare gir et tomt felt på siden.
    category: values.category as Listing["category"],
    condition: values.condition as Listing["condition"],
    price,
    status: "active",
    createdAt: new Date(0),
    updatedAt: new Date(0),
  };
}
