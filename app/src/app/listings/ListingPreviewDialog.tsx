"use client";
// «Forhåndsvis» i «Legg ut annonse» (#171, mockup godkjent av Max 12.10): selve annonsesiden med det som er skrevet,
// i en dialog over skjemaet, så ingenting går tapt. Dialogen ligger inne i skjemaet, så «Publiser» her sender skjemaet.
import { useEffect, useRef } from "react";
import { ListingDetails } from "./ListingDetails";
import { draftListing } from "./draft-listing";
import type { GalleryImage } from "./ListingGallery";
import type { ListingFormValues } from "./listing-schema";

type Props = {
  open: boolean;
  onClose: () => void;
  values: ListingFormValues;
  images: GalleryImage[];
  ownerName: string;
  busy: boolean;
  publishLabel: string;
};

const button = "h-12 flex-1 rounded-md px-6 text-lg font-semibold transition-colors sm:flex-none";

export function ListingPreviewDialog({ open, onClose, values, images, ownerName, busy, publishLabel }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  // Dialogen åpnes og lukkes av open, også når nettleseren lukker den selv (Esc).
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-label="Forhåndsvisning"
      className="m-0 h-dvh max-h-none w-screen max-w-none flex-col bg-paper p-0 text-ink backdrop:bg-ink/40 open:flex"
    >
      {open && (
        <>
          <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 sm:px-12 sm:pt-10">
            <ListingDetails listing={draftListing(values)} ownerName={ownerName} images={images} backLink={null} />
          </div>
          <div className="flex gap-3 border-t border-hairline bg-surface px-4 py-3 sm:justify-end sm:px-12">
            <button type="button" onClick={onClose} className={`${button} border-2 border-ink bg-surface hover:bg-paper`}>
              Avbryt
            </button>
            <button
              type="submit"
              disabled={busy}
              aria-busy={busy}
              className={`${button} bg-action text-white enabled:hover:bg-action-hover disabled:cursor-wait disabled:opacity-70`}
            >
              {publishLabel}
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
