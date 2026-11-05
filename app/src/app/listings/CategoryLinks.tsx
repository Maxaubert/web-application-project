// Kategoriraden i plommebåndet på forsiden (Torget, #288). Vanlige lenker på det samme kategorifilteret som
// i sidekolonnen, så søkeordet og de andre filtrene blir med, og siden virker uten JavaScript.
import { categoryLabels } from "./labels";
import type { ListingFilters } from "./search-params";
import { searchPageUrl } from "./search-url";

type Props = { q: string; filters: ListingFilters; available: string[] };

function linkTo(q: string, { type, condition, minPrice, maxPrice }: ListingFilters, category?: string) {
  return searchPageUrl([
    ["q", q],
    ["category", category ?? ""],
    ...type.map((value): [string, string] => ["type", value]),
    ...condition.map((value): [string, string] => ["condition", value]),
    ["minPrice", minPrice?.toString() ?? ""],
    ["maxPrice", maxPrice?.toString() ?? ""],
  ]);
}

const linkClass =
  "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 font-semibold whitespace-nowrap transition-colors " +
  "hover:bg-plum-hover aria-[current=true]:bg-mint aria-[current=true]:text-plum-ink";

export function CategoryLinks({ q, filters, available }: Props) {
  const shown = Object.entries(categoryLabels).filter(([value]) => available.includes(value) || filters.category === value);
  return (
    <nav aria-label="Kategorier" className="flex gap-1.5 overflow-x-auto px-4 pb-2 sm:px-12">
      <a href={linkTo(q, filters)} aria-current={filters.category ? undefined : "true"} className={linkClass}>
        Alle
      </a>
      {shown.map(([value, label]) => (
        <a key={value} href={linkTo(q, filters, value)} aria-current={filters.category === value ? "true" : undefined} className={linkClass}>
          {label}
        </a>
      ))}
    </nav>
  );
}
