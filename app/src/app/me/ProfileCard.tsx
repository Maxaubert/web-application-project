// Profilen øverst på Min side (#193): avatar, navn, e-post og telefon. Bare eieren selv ser denne siden,
// så kontaktinfoen vises her uten å lekke til andre. Rediger profil kommer senere.
import { formatPhone } from "@/app/auth/phone";
import type { Profile } from "./queries";

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <section aria-label="Profil" className="mt-4 flex items-center gap-4">
      <span aria-hidden="true" className="grid size-16 shrink-0 place-items-center rounded-full bg-hairline sm:size-[4.5rem]">
        <svg viewBox="0 0 24 24" className="size-7 fill-none stroke-muted stroke-2 sm:size-8">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-lg font-bold [overflow-wrap:anywhere] sm:text-xl">{profile.name}</p>
        <p className="text-sm text-muted [overflow-wrap:anywhere]">{profile.email}</p>
        {profile.phone && <p className="text-sm text-muted">{formatPhone(profile.phone)}</p>}
      </div>
    </section>
  );
}
