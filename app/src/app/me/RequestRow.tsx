// Én forespørsel i listen på Min side (#193, mockup godkjent av Max 17.10): bilde, tittel, motpart og bud, type og
// tidspunkt, og en chip med hvis tur det er. Hele kortet er en lenke til forespørselssiden (tittelen strekkes over kortet).
// På mobil er raden et eget kort med chip og «Åpne ›» nederst; fra 640 px ligger radene i én ramme med chipen til høyre.
import { imageUrl } from "@/app/images/image-url";
import { typeLabels } from "@/app/listings/labels";
import { ListingImage } from "@/app/listings/ListingImage";
import type { MyRequest } from "@/app/requests/queries";
import { chipFor, formatWhen } from "@/app/requests/request-view";

export function RequestRow({ item }: { item: MyRequest }) {
  const chip = chipFor(item.status, item.role);
  const who = `${item.role === "requester" ? "Til " : ""}${item.otherName}`;
  const bid = item.price === null ? "" : ` · ${item.price.toLocaleString("nb-NO")} kr`;
  const tone = chip.yourTurn ? "border-action bg-action text-white" : "border-ink text-ink";

  return (
    <li className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 rounded-xl border-2 border-hairline bg-surface p-3.5 transition-colors hover:border-line sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:rounded-none sm:border-0 sm:p-4 sm:hover:bg-paper">
      <ListingImage
        src={item.coverKey && imageUrl(item.coverKey, "thumb")}
        className="size-20 shrink-0 rounded-lg sm:size-28 sm:rounded-xl"
        iconClassName="size-8"
      />
      <div className="min-w-0">
        <h2 className="text-lg font-bold [overflow-wrap:anywhere] sm:text-xl">
          <a href={`/requests/${item.id}`} className="after:absolute after:inset-0">
            {item.listing.title}
          </a>
        </h2>
        <p className="text-muted [overflow-wrap:anywhere]">
          {who}
          {bid}
        </p>
        <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-md border border-line px-2">{typeLabels[item.listing.type]}</span>
          <span className="text-muted">
            <span className="hidden sm:inline">Sist endret </span>
            {formatWhen(item.changedAt)}
          </span>
        </p>
      </div>
      <div className="col-span-2 mt-3 flex items-center justify-between border-t border-hairline pt-3 sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:mt-0 sm:items-start sm:border-0 sm:pt-0">
        <span className={`rounded-full border-2 px-3 py-0.5 text-sm font-bold whitespace-nowrap ${tone}`}>{chip.text}</span>
        <span aria-hidden="true" className="text-muted sm:hidden">
          Åpne ›
        </span>
      </div>
    </li>
  );
}
