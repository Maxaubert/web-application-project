// Innholdet på annonsesiden (WF-04): bilde til venstre, fakta til høyre; under hverandre på mobil.
// Serverkomponent, bare visning. Handlingsknappen kommer med bud- og lånesidene.
import type { Listing } from "@/db/schema";
import { formatPrice } from "./format-type-and-price";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { categoryLabels, conditionLabels, typeLabels } from "./labels";

type ListingDetailsProps = { listing: Listing; ownerName: string };

// Overskriften i eierboksen, som i wireframene: «Selger» ved salg, «Eier» ved lån. Gis bort er ikke tegnet (#64).
const ownerHeadings: Record<Listing["type"], string> = { sale: "Selger", loan: "Eier", giveaway: "Eier" };

const pill = "inline-block rounded-full border-2 px-3 py-0.5 text-sm font-semibold";

export function ListingDetails({ listing, ownerName }: ListingDetailsProps) {
  const price = formatPrice(listing);

  return (
    <>
      <a href="/" className="underline underline-offset-4">‹ Tilbake til annonser</a>
      <div className="mt-6 grid gap-8 lg:grid-cols-[3fr_2fr] lg:gap-12">
        <ImagePlaceholder className="aspect-[4/3] rounded-xl" />
        <div>
          <p className="flex flex-wrap gap-2">
            <span className={`${pill} border-ink`}>{typeLabels[listing.type]}</span>
            {listing.status === "sold" && <span className={`${pill} border-ink bg-ink text-paper`}>Solgt</span>}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">{listing.title}</h1>
          {price && <p className="mt-3 text-2xl font-bold">{price}</p>}

          <dl className="mt-8 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted">Kategori</dt>
              <dd className="text-lg font-semibold">{categoryLabels[listing.category]}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Tilstand</dt>
              <dd className="text-lg font-semibold">{conditionLabels[listing.condition]}</dd>
            </div>
          </dl>

          <h2 className="mt-8 text-xl font-bold">Beskrivelse</h2>
          <p className="mt-2 text-lg whitespace-pre-line">{listing.description}</p>

          <section className="mt-8 rounded-xl border-2 border-hairline bg-surface px-5 py-4">
            <h2 className="font-bold">{ownerHeadings[listing.type]}</h2>
            <p className="mt-1 text-lg">{ownerName}</p>
          </section>
        </div>
      </div>
    </>
  );
}
