// Mini-forhåndsvisning øverst i «Legg ut annonse» (mockup 13, #133): en liten utgave av annonsesiden som
// oppdateres mens man skriver. Bildeflaten er der man legger til bilder; låst til opplasting finnes (#61).
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

export function ListingPreview({ values }: { values: ListingFormValues }) {
  const type = values.type as Listing["type"];
  const price = type === "sale" || type === "loan" ? previewPrice(type, values.price) : null;
  const category = categoryLabels[values.category as Listing["category"]];
  const condition = conditionLabels[values.condition as Listing["condition"]];

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
        <button
          type="button"
          disabled
          aria-describedby="images-soon"
          className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 bg-hairline/60 text-lg font-semibold text-muted"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-12 fill-none stroke-muted stroke-[1.5]">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="9" cy="10" r="2" />
            <path d="m21 17-5-5-9 8" />
          </svg>
          Legg til bilder
        </button>
        <div className="border-t border-hairline px-5 py-4">
          <p className="text-base text-muted">{typeLabels[type] ?? "Handelstype"}</p>
          <p className={`mt-0.5 text-2xl font-bold [overflow-wrap:anywhere] ${values.title.trim() ? "" : muted}`}>{values.title.trim() || "Tittel"}</p>
          {price && <p className={`mt-1 text-lg font-bold ${price.placeholder ? muted : ""}`}>{price.text}</p>}
          <p className="mt-2 text-base text-muted">
            {category ?? "Kategori"} · {condition ?? "Tilstand"}
          </p>
        </div>
      </div>
      <p id="images-soon" className="mt-3 flex gap-2 text-base text-muted">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 size-5 shrink-0 fill-none stroke-muted stroke-2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
        Bildeopplasting kommer snart. Annonsen får et plassholderbilde inntil videre.
      </p>
    </div>
  );
}
