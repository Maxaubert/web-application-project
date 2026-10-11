"use client";
// Bildene på annonsesiden (#150, mockup godkjent av Max 11.10): ett stort bilde og miniatyrer under.
// Under 640 px ligger miniatyrene på én rad som rulles sidelengs (#167); ellers brytes de over flere linjer.
// Klikk på en miniatyr viser den stort. Med ett bilde vises ingen miniatyrer, uten bilder plassholderen.
import { useState } from "react";
import { ListingImage } from "./ListingImage";

// src er det store bildet, thumb miniatyren i raden under (#155).
export type GalleryImage = { src: string; thumb: string };

export function ListingGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [selected, setSelected] = useState(0);
  const shown = images[selected]?.src ?? null;

  return (
    <div>
      <ListingImage
        src={shown}
        alt={images.length > 1 ? `${title}, bilde ${selected + 1} av ${images.length}` : title}
        className="aspect-[4/3] w-full rounded-xl"
        iconClassName="size-14"
      />
      {images.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto sm:flex-wrap sm:overflow-visible">
          {images.map(({ src, thumb }, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Vis bilde ${index + 1} av ${images.length}`}
              aria-pressed={index === selected}
              className="size-16 shrink-0 overflow-hidden rounded-lg bg-hairline/60 bg-cover bg-center aria-pressed:shadow-[inset_0_0_0_3px_var(--color-paper),inset_0_0_0_5px_var(--color-ink)] sm:size-[86px]"
              style={{ backgroundImage: `url(${thumb})` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
