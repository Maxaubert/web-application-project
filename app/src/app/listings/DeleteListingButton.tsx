"use client";
// «Slett annonse» i «Administrer» (#229). Står i knapperaden med de andre, og spør i et sprettoppvindu (Max 24.10: aldri
// en boks under knappene). Den ligger inne i redigeringsskjemaet, så den har ikke eget skjema: «Ja, slett» sender
// listingId til serverhandlingen takeDownListing selv. Annonsen tas ned og dataene beholdes; ved suksess til Mine annonser.
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { asFormState, type ActionResult } from "@/app/auth/form-state";
import { FieldError } from "@/app/shared/form-controls";
import { takeDownListing } from "./actions";

const button = "h-12 rounded-md px-6 text-lg font-semibold transition-colors disabled:cursor-wait disabled:opacity-70";
// «Slett annonse» har rød kant og står helt til venstre i knapperaden (Max 24.10), så den ikke forveksles med «Lagre endringer».
// «Ja, slett» i vinduet er fylt rød, for der er valget tatt.
const outlined = `${button} border-2 border-danger bg-surface text-danger hover:bg-paper`;
const danger = `${button} bg-danger text-white enabled:hover:opacity-90`;

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const [result, action, pending] = useActionState<ActionResult, FormData>(takeDownListing, {});
  const state = asFormState(result);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  // Vinduet åpnes og lukkes av open, også når nettleseren lukker det selv (Esc), som i ListingPreviewDialog.
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  function confirm() {
    const data = new FormData();
    data.set("listingId", listingId);
    startTransition(() => action(data));
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${outlined} sm:mr-auto`}>
        Slett annonse
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        aria-labelledby="delete-listing-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border-2 border-ink bg-surface p-6 text-ink backdrop:bg-ink/40"
      >
        {open && (
          <div className="space-y-5">
            <h2 id="delete-listing-title" className="text-xl font-bold">
              Slette annonsen?
            </h2>
            <FieldError id="delete-listing-error" message={state.error} />
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setOpen(false)} className={`${button} border-2 border-ink bg-surface hover:bg-paper`}>
                Avbryt
              </button>
              <button type="button" onClick={confirm} disabled={pending} aria-busy={pending} className={danger}>
                Ja, slett
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
