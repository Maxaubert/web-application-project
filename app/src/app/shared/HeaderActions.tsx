// Knappene øverst til høyre for innloggede: «Min side» (#193), «Legg ut annonse» (FK-03, #133) og «Logg ut». På mobil er de
// ikonknapper på 44 px (#162); navnet står igjen for skjermlesere. Fra 640 px er det tekstknapper.
// På siden selv har knappen aria-current, så skjermlesere sier at man er der. Ingen synlig ring: Max syntes den
// så ut som en stygg fokusmarkering (11.10, #135). «Min side» er understreket når man er der, som lenken i wireframene.
import { LogoutButton } from "@/app/auth/LogoutButton";

export function HeaderActions({ current }: { current?: "new-listing" | "me" }) {
  const active = current === "new-listing";
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <a
        href="/me"
        aria-current={current === "me" ? "page" : undefined}
        className="inline-flex size-11 items-center justify-center rounded-md font-semibold whitespace-nowrap transition-colors hover:bg-paper sm:w-auto sm:px-3"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-none stroke-current stroke-2 sm:hidden">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />
        </svg>
        <span className={`sr-only sm:not-sr-only ${current === "me" ? "underline decoration-2 underline-offset-8" : ""}`}>Min side</span>
      </a>
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
