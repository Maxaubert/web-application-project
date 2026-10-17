// Det lille annonsekortet øverst på budsiden og forespørselssiden: bilde, tittel, type og pris, og eventuelt selgeren.
import { ListingImage } from "@/app/listings/ListingImage";

type ListingSummaryProps = { title: string; typeAndPrice: string; thumb: string | null; sellerName?: string };

export function ListingSummary({ title, typeAndPrice, thumb, sellerName }: ListingSummaryProps) {
  return (
    <div className="flex gap-4 rounded-xl border-2 border-hairline bg-surface p-3">
      <ListingImage src={thumb} className="size-[4.5rem] shrink-0 rounded-lg" iconClassName="size-8" />
      <div className="min-w-0">
        <p className="font-bold [overflow-wrap:anywhere]">{title}</p>
        <p>{typeAndPrice}</p>
        {sellerName && <p className="text-sm text-muted">Selger: {sellerName}</p>}
      </div>
    </div>
  );
}
