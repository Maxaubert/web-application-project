"use client";
// Meldingen etter et svar (#203, valgt av Max 19.10): en mørk stripe øverst som forsvinner etter 5 sekunder. Den
// ligger på siden og ikke i knappene, for knappene er borte når svaret er sendt. Markøren ?sendt= fjernes fra adressen,
// så en oppdatering av siden ikke viser meldingen igjen.
import { useEffect, useState } from "react";

export const TOAST_MS = 5000;

export function Toast({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("sendt")) {
      url.searchParams.delete("sendt");
      window.history.replaceState(window.history.state, "", url);
    }
    const timer = setTimeout(() => setVisible(false), TOAST_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    // role="status": skjermlesere leser meldingen opp. Stripen tar ikke imot klikk, så den aldri skjuler en knapp under seg.
    <div role="status" className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <p className="flex items-center gap-3 rounded-xl bg-action px-5 py-3 text-base font-semibold text-white shadow-lg">
        <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-sm font-bold text-action">
          ✓
        </span>
        {message}
      </p>
    </div>
  );
}
