"use client";
// «Logg ut» sletter økten på serveren (Max 05.10: alltid synlig utlogging). På mobil er den en ikonknapp (#162).
import { useActionState } from "react";
import { logout } from "./actions";
import type { ActionResult } from "./form-state";

export function LogoutButton() {
  const [, action, pending] = useActionState<ActionResult>(logout, {});
  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending}
        className="grid size-11 place-items-center rounded-md border-2 border-ink bg-surface font-semibold whitespace-nowrap transition-colors enabled:hover:bg-paper disabled:cursor-wait disabled:opacity-70 sm:inline-flex sm:w-auto sm:items-center sm:px-4"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-none stroke-ink stroke-2 sm:hidden">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="sr-only sm:not-sr-only">{pending ? "Logger ut …" : "Logg ut"}</span>
      </button>
    </form>
  );
}
