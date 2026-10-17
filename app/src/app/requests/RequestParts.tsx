// Delene av forespørselssiden (#192): banneret, budkortet og historikken. Bare visning.
import type { Banner } from "./request-view";

export function StatusBanner({ banner }: { banner: Banner }) {
  // Mørkt når det er din tur, lyst når du venter eller forespørselen er avsluttet. role="status": skjermlesere leser det opp.
  const tone = banner.yourTurn ? "bg-action text-white" : "border-2 border-hairline bg-surface text-ink";
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

// Nyeste først; de eldre er grået, så det er tydelig hva som gjelder nå.
export function History({ lines }: { lines: string[] }) {
  return (
    <section className="rounded-xl sm:border-2 sm:border-hairline sm:bg-surface sm:px-5 sm:py-4">
      <h2 className="text-xl font-bold">Historikk</h2>
      <ul className="mt-3 space-y-2">
        {lines.map((line, index) => (
          <li key={`${index}-${line}`}className={`flex items-baseline gap-3 ${index === 0 ? "" : "text-muted"}`}>
            <span aria-hidden="true" className="size-2 shrink-0 -translate-y-px rounded-full bg-line" />
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
