// Mini-forhåndsvisning øverst i «Legg ut annonse» (mockup 13, #133): en liten utgave av annonsesiden som
// oppdateres mens man skriver. Bildeflaten (photo) kommer fra ImageField, der man legger til bilder (#141).
import type { ReactNode } from "react";
import type { Listing } from "@/db/schema";
import { formatPrice } from "./format-type-and-price";
import { categoryLabels, conditionLabels, typeLabels } from "./labels";
import type { ListingFormValues } from "./listing-schema";

const muted = "text-muted";

// Prisen slik den vil se ut; gis bort har ingen pris. Tom eller ugyldig salgspris vises som en grå plassholder.
function previewPrice(type: "sale" | "loan", raw: string): { text: string; placeholder: boolean } {
  const value = /^\d+$/.test(raw.trim()) ? Number(raw.trim()) : null;
  if (type === "sale" && value === null) return { text: "Pris", placeholder: true };
  return { text: formatPrice({ type, price: value }) ?? "", placeholder: false };
}

// invalid: rød kant når annonsen mangler bilde (#141).
export function ListingPreview({ values, photo, invalid = false }: { values: ListingFormValues; photo: ReactNode; invalid?: boolean }) {
  const type = values.type as Listing["type"];
  const price = type === "sale" || type === "loan" ? previewPrice(type, values.price) : null;
  const category = categoryLabels[values.category as Listing["category"]];
  const condition = conditionLabels[values.condition as Listing["condition"]];

  return (
    <div className={`overflow-hidden rounded-xl bg-surface ${invalid ? "border-2 border-danger" : "border border-hairline"}`}>
      {photo}
      <div className="border-t border-hairline px-5 py-4">
        <p className="text-base text-muted">{typeLabels[type] ?? "Handelstype"}</p>
        <p className={`mt-0.5 text-2xl font-bold [overflow-wrap:anywhere] ${values.title.trim() ? "" : muted}`}>{values.title.trim() || "Tittel"}</p>
        {price && <p className={`mt-1 text-lg font-bold ${price.placeholder ? muted : ""}`}>{price.text}</p>}
        <p className="mt-2 text-base text-muted">
          {category ?? "Kategori"} · {condition ?? "Tilstand"}
        </p>
      </div>
    </div>
  );
}
