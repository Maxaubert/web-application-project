"use client";
// Bildene i «Legg ut annonse» (#141, mockup godkjent av Max 11.10). Klikk på bildeflaten eller «Legg til» åpner
// filvelgeren, og på desktop kan bilder dras inn. Miniatyrer bare for bilder som er lagt til; klikk på en gjør
// den til forsidebilde. Ingen forklaringstekst, bare feil (Max 11.10). Under 640 px er forhåndsvisningen skjult
// (#169), så «Tittel» kommer høyt opp; da er det miniatyrraden med «Legg til» som viser og legger til bildene.
import { useRef, useState, type DragEvent } from "react";
import { MAX_IMAGES } from "@/db/schema";
import { FieldError } from "@/app/shared/form-controls";
import type { ListingFormValues } from "./listing-schema";
import { ListingPreview } from "./ListingPreview";
import type { useListingImages } from "./useListingImages";

type Props = { values: ListingFormValues; images: ReturnType<typeof useListingImages>; error?: string };

const busyOverlay = "pointer-events-none absolute inset-0 grid place-items-center bg-ink/55 p-1 text-center font-semibold text-white";

export function ImageField({ values, images, error }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const open = () => input.current?.click();
  const [cover] = images.images;

  const drop = {
    onDragOver: (event: DragEvent) => {
      event.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (event: DragEvent) => {
      event.preventDefault();
      setDragging(false);
      images.add([...event.dataTransfer.files]);
    },
  };
  const dragRing = dragging ? "shadow-[inset_0_0_0_3px_var(--color-ink)]" : "";

  const photo = cover ? (
    <div {...drop} className={`relative aspect-[16/9] bg-hairline/60 bg-cover bg-center ${dragRing}`} style={{ backgroundImage: `url(${cover.url})` }}>
      <span className="absolute top-3 left-3 rounded-md bg-surface/90 px-2.5 py-1 text-sm font-bold">Forsidebilde</span>
      {!cover.file && <span className={`${busyOverlay} text-lg`}>Gjør klar …</span>}
    </div>
  ) : (
    <button
      type="button"
      onClick={open}
      {...drop}
      aria-describedby={error ? "images-error" : undefined}
      className={`flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 bg-hairline/60 text-lg font-semibold text-muted ${dragRing}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-12 fill-none stroke-muted stroke-[1.5]">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="m21 17-5-5-9 8" />
      </svg>
      {dragging ? "Slipp bildene her" : "Legg til bilder"}
    </button>
  );

  return (
    <div>
      <div className="max-sm:hidden">
        <ListingPreview values={values} photo={photo} invalid={Boolean(error)} />
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        hidden
        aria-label="Bilder"
        onChange={(event) => {
          images.add([...(event.target.files ?? [])]);
          event.target.value = "";
        }}
      />
      <div className="mt-3 flex flex-wrap gap-2.5">
        {images.images.map((image, index) => (
          <div key={image.id} className="relative size-[72px] overflow-hidden rounded-lg sm:size-[86px]">
            <button
              type="button"
              onClick={() => images.makeCover(image.id)}
              aria-label={`Bilde ${index + 1}`}
              aria-pressed={index === 0}
              className="size-full rounded-lg bg-hairline/60 bg-cover bg-center aria-pressed:shadow-[inset_0_0_0_3px_var(--color-surface),inset_0_0_0_5px_var(--color-ink)]"
              style={{ backgroundImage: `url(${image.thumbUrl ?? image.url})` }}
            />
            {!image.file && <span className={`${busyOverlay} text-sm`}>Gjør klar …</span>}
            <button
              type="button"
              onClick={() => images.remove(image.id)}
              aria-label={`Fjern bilde ${index + 1}`}
              className="absolute top-1 right-1 grid size-8 place-items-center rounded-full bg-surface/95 text-base font-bold"
            >
              ✕
            </button>
          </div>
        ))}
        {images.images.length < MAX_IMAGES && (
          <button
            type="button"
            id="listing-images-add"
            onClick={open}
            aria-describedby={error ? "images-error" : undefined}
            className={`inline-flex size-[72px] flex-col items-center justify-center rounded-lg border-2 ${error ? "border-danger" : "border-ink"} bg-surface text-sm leading-tight font-semibold transition-colors hover:bg-paper sm:size-[86px]`}
          >
            <span aria-hidden="true" className="text-3xl leading-none font-normal">
              +
            </span>
            Legg til
          </button>
        )}
      </div>
      {error && (
        <div className="mt-3">
          <FieldError id="images-error" message={error} />
        </div>
      )}
      {images.rejected.length > 0 && (
        <div role="alert" className="mt-3 rounded-lg border-2 border-danger px-4 py-3 font-semibold text-danger">
          {images.rejected.length === 1 ? "1 fil ble ikke lagt til:" : `${images.rejected.length} filer ble ikke lagt til:`}
          <ul className="mt-1 list-disc pl-5 font-normal">
            {images.rejected.map((file, index) => (
              <li key={index}>
                {file.name}: {file.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
