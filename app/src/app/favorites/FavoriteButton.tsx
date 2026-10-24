"use client";
// Hjertet på annonsekortet og annonsesiden (FK-14, #224). Snur med én gang (useOptimistic) og sender valget til
// serverhandlingen toggleFavorite. Siden tegnes på nytt med svaret fra serveren; avviser serveren, står hjertet som
// før og feilen vises under. Reglene ligger i favorites.ts.
import { useActionState, useOptimistic } from "react";
import { asFormState, type ActionResult } from "@/app/auth/form-state";
import { toggleFavorite } from "./actions";

export function FavoriteButton({ listingId, saved }: { listingId: string; saved: boolean }) {
  const [result, send] = useActionState<ActionResult, FormData>(toggleFavorite, {});
  const { error } = asFormState(result);
  const [shown, setShown] = useOptimistic(saved);

  function submit(formData: FormData) {
    setShown(!shown);
    send(formData);
  }

  return (
    <form action={submit} className="flex flex-col items-end gap-1">
      <input type="hidden" name="listingId" value={listingId} />
      <button
        type="submit"
        name="intent"
        value={shown ? "off" : "on"}
        aria-pressed={shown}
        aria-label={shown ? "Fjern fra favoritter" : "Lagre som favoritt"}
        className="inline-flex size-11 items-center justify-center rounded-full border border-hairline bg-surface hover:border-ink"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className={`size-6 stroke-ink stroke-2 ${shown ? "fill-ink" : "fill-none"}`}>
          <path
            d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8.2 3.6 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.6 0 5.7 3.7 4.5 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {/* role="alert": skjermlesere leser feilen opp. Egen bakgrunn, fordi den kan stå over bildet på kortet. */}
      {error && (
        <p role="alert" className="rounded-md bg-surface px-2 py-1 text-base font-medium text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
