// Knappene øverst til høyre for innloggede: «Legg ut annonse» (FK-03, #133) og «Logg ut». På mobil er de
// ikonknapper på 44 px (#162); navnet står igjen for skjermlesere. Fra 640 px er det tekstknapper.
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
        className="inline-flex size-11 items-center justify-center rounded-md bg-action font-semibold whitespace-nowrap text-white transition-colors hover:bg-action-hover sm:w-auto sm:px-4"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-none stroke-current stroke-2 sm:hidden">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        <span className="sr-only sm:not-sr-only">Legg ut annonse</span>
      </a>
      <LogoutButton />
    </div>
  );
}
