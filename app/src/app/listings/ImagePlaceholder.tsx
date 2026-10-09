// Grå flate med bildeikon der annonsebildene skal stå til bildene kommer (#61).
// Brukes av kortet og annonsesiden, så begge allerede har sin endelige form.
export function ImagePlaceholder({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center bg-hairline/60 ${className}`}>
      <svg viewBox="0 0 24 24" className="size-10 fill-none stroke-muted stroke-[1.5]">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="m21 17-5-5-9 8" />
      </svg>
    </div>
  );
}
