// Det lille annonsekortet øverst på budsiden og forespørselssiden: bilde, tittel, type og pris, og eventuelt selgeren.
// href: gjør hele kortet til en lenke til annonsen (forespørselssiden, #193); budsiden har den ikke.
import { ListingImage } from "@/app/listings/ListingImage";

type ListingSummaryProps = { title: string; typeAndPrice: string; thumb: string | null; sellerName?: string; href?: string };

export function ListingSummary({ title, typeAndPrice, thumb, sellerName, href }: ListingSummaryProps) {
  return (
    <div className={`relative flex gap-4 rounded-xl border-2 border-hairline bg-surface p-3 ${href ? "transition-colors hover:border-line" : ""}`}>
      <ListingImage src={thumb} className="size-[4.5rem] shrink-0 rounded-lg" iconClassName="size-8" />
      <div className="min-w-0">
        <p className="font-bold [overflow-wrap:anywhere]">
          {href ? (
            <a href={href} className="after:absolute after:inset-0">
              {title}
            </a>
          ) : (
            title
          )}
        </p>
        <p>{typeAndPrice}</p>
        {sellerName && <p className="text-sm text-muted">Selger: {sellerName}</p>}
      </div>
    </div>
  );
}
