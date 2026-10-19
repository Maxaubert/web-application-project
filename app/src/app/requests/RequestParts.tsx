// Delene av forespørselssiden (#192): banneret og budkortet. Bare visning.
import type { Banner } from "./request-view";

export function StatusBanner({ banner }: { banner: Banner }) {
  // Mørk kant når det er din tur, lys kant når du venter eller forespørselen er avsluttet. Ikke fylt: en mørk flate
  // ser ut som en knapp (Max 18.10, #187). role="status": skjermlesere leser det opp.
  const tone = `border-2 bg-surface text-ink ${banner.yourTurn ? "border-ink" : "border-hairline"}`;
  return (
    <p role="status" className={`rounded-xl px-4 py-4 text-lg font-bold [overflow-wrap:anywhere] ${tone}`}>
      {banner.text}
    </p>
  );
}

type OfferCardProps = { bidLabel: string; bid: string; priceLabel: string; price: string };

export function OfferCard({ bidLabel, bid, priceLabel, price }: OfferCardProps) {
  return (
    <dl className="grid grid-cols-2 gap-4 rounded-xl border-2 border-hairline bg-surface px-4 py-3.5">
      <div>
        <dt className="text-sm text-muted">{bidLabel}</dt>
        <dd className="text-2xl font-bold">{bid}</dd>
      </div>
      <div>
        <dt className="text-sm text-muted">{priceLabel}</dt>
        <dd className="text-2xl font-bold">{price}</dd>
      </div>
    </dl>
  );
}
