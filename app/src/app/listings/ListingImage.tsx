// Et annonsebilde, eller den grå plassholderen når annonsen ikke har bilde (#150). Brukes av kortet,
// søkeforslagene og annonsesiden, så alle viser bildet i samme form som plassholderen hadde.
import { ImagePlaceholder } from "./ImagePlaceholder";

// alt="" der tittelen står rett ved siden av (kort, forslag), så skjermlesere ikke leser den to ganger.
type Props = { src: string | null; alt?: string; className?: string; iconClassName?: string };

export function ListingImage({ src, alt = "", className = "", iconClassName }: Props) {
  if (!src) return <ImagePlaceholder className={className} iconClassName={iconClassName} />;
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={`block bg-hairline/60 object-cover ${className}`} />;
}
