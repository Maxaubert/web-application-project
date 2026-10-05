"use client";
// «Logg ut» sletter økten på serveren (Max 05.10: alltid synlig utlogging).
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
        className="h-12 w-full rounded-md border-2 border-action bg-surface text-lg font-semibold hover:bg-paper disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Logger ut …" : "Logg ut"}
      </button>
    </form>
  );
}
