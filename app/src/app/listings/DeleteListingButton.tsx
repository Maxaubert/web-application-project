"use client";
// «Slett annonse» i «Administrer» (#229, Max 24.10). Spør «Ja, slett» først (lokal tilstand), som Avbestill i
// HandoverActions, og sender til serverhandlingen takeDownListing: annonsen tas ned, dataene beholdes. Ved suksess til
// Mine annonser; avviser serveren, vises feilen under.
import { useActionState, useState } from "react";
import { asFormState, type ActionResult } from "@/app/auth/form-state";
import { FieldError } from "@/app/shared/form-controls";
import { takeDownListing } from "./actions";

const danger =
  "h-12 rounded-md border-2 border-danger bg-surface px-6 text-lg font-semibold text-danger enabled:hover:bg-paper disabled:cursor-wait disabled:opacity-70";

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const [result, action, pending] = useActionState<ActionResult, FormData>(takeDownListing, {});
  const state = asFormState(result);
  const [asking, setAsking] = useState(false);

  return (
    <form action={action} noValidate className="space-y-3">
      <input type="hidden" name="listingId" value={listingId} />
      <FieldError id="delete-listing-error" message={state.error} />
      {/* Egen key per del, så React lager nye knapper og klikket på «Slett annonse» ikke sender skjemaet. */}
      {asking ? (
        <div key="ask" className="space-y-3 rounded-xl border-2 border-danger bg-surface p-4">
          <p className="text-lg font-bold">Slette annonsen?</p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={pending} aria-busy={pending} className={danger}>
              Ja, slett
            </button>
            <button type="button" onClick={() => setAsking(false)} className="min-h-12 px-2 font-semibold underline">
              Avbryt
            </button>
          </div>
        </div>
      ) : (
        <button key="idle" type="button" onClick={() => setAsking(true)} className={danger}>
          Slett annonse
        </button>
      )}
    </form>
  );
}
