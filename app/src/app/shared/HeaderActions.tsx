// Knappene øverst til høyre for innloggede: «Legg ut annonse» (FK-03, #133) og «Logg ut».
// På siden selv har knappen aria-current, så skjermlesere sier at man er der. Ingen synlig ring: Max syntes den
// så ut som en stygg fokusmarkering (11.10, #135).
import { LogoutButton } from "@/app/auth/LogoutButton";

export function HeaderActions({ current }: { current?: "new-listing" }) {
  const active = current === "new-listing";
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <a
        href="/listings/new"
        aria-current={active ? "page" : undefined}
        className="inline-flex h-11 items-center rounded-md bg-action px-3 font-semibold whitespace-nowrap text-white transition-colors hover:bg-action-hover sm:px-4"
      >
        {/* Kort tekst på mobil, så begge knappene får plass ved siden av logoen. */}
        <span className="sm:hidden">Legg ut</span>
        <span className="hidden sm:inline">Legg ut annonse</span>
      </a>
      <LogoutButton />
    </div>
  );
}
