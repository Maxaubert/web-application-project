// Grå flate med bildeikon der annonsebildene skal stå til bildene kommer (#61).
// Brukes av kortet, annonsesiden og søkeforslagene, så alle allerede har sin endelige form.
type Props = { className?: string; iconClassName?: string };

export function ImagePlaceholder({ className = "", iconClassName = "size-10" }: Props) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center bg-hairline/60 ${className}`}>
      <svg viewBox="0 0 24 24" className={`${iconClassName} fill-none stroke-muted stroke-[1.5]`}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="m21 17-5-5-9 8" />
      </svg>
    </div>
  );
}
