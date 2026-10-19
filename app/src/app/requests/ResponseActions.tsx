"use client";
// Knappene under budkortet (WF-08, #187) for den som har tur: Godta, Motbud og Avslå. Motbud åpner et prisfelt og
// Avslå en bekreftelse; begge er lokal tilstand. Alt valideres på nytt i serverhandlingen respondToRequest.
import { useActionState, useState } from "react";
import { asFormState, type ActionResult } from "@/app/auth/form-state";
import { FieldError, TextField } from "@/app/shared/form-controls";
import { respondToRequest } from "./actions";

type Mode = "idle" | "counter" | "decline";
type ResponseActionsProps = { requestId: string; offerId: string };

const secondary =
  "h-12 w-full rounded-md border-2 border-ink bg-surface text-base font-semibold enabled:hover:bg-paper disabled:cursor-wait disabled:opacity-70";
const primary =
  "h-14 w-full rounded-md bg-action text-lg font-semibold text-white transition-colors enabled:hover:bg-action-hover disabled:cursor-wait disabled:opacity-70";

export function ResponseActions({ requestId, offerId }: ResponseActionsProps) {
  const [result, action, pending] = useActionState<ActionResult, FormData>(respondToRequest, {});
  const state = asFormState(result);
  const [mode, setMode] = useState<Mode>("idle");
  const open = state.fieldErrors?.price ? "counter" : mode;

  return (
    <form action={action} noValidate>
      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" name="offerId" value={offerId} />
      <FieldError id="response-error" message={state.error} />
      {/* Hver del har egen key, så React lager nye knapper: ellers blir «Motbud» til «Send motbud» midt i klikket, og klikket sender skjemaet. */}
      {open === "counter" ? (
        <div key="counter" className="mt-3 space-y-3">
          <TextField
            id="counter-price"
            name="price"
            label="Ditt motbud (kr)"
            inputMode="numeric"
            autoComplete="off"
            defaultValue={state.values?.price ?? ""}
            error={state.fieldErrors?.price}
          />
          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <button type="submit" name="intent" value="counter" disabled={pending} aria-busy={pending} className={primary}>
              Send motbud
            </button>
            <button type="button" onClick={() => setMode("idle")} className="min-h-12 px-2 font-semibold underline">
              Avbryt
            </button>
          </div>
        </div>
      ) : (
        <div key="idle" className="mt-3 space-y-3">
          <button type="submit" name="intent" value="accept" disabled={pending} aria-busy={pending} className={primary}>
            Godta
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setMode("counter")} className={secondary}>
              Motbud
            </button>
            <button type="button" onClick={() => setMode("decline")} aria-expanded={open === "decline"} className={secondary}>
              Avslå
            </button>
          </div>
          {open === "decline" && (
            <div className="space-y-3 rounded-xl border-2 border-ink bg-surface p-4">
              <p className="text-lg font-bold">Avslå forespørselen?</p>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <button type="submit" name="intent" value="decline" disabled={pending} aria-busy={pending} className={primary}>
                  Ja, avslå
                </button>
                <button type="button" onClick={() => setMode("idle")} className="min-h-12 px-2 font-semibold underline">
                  Avbryt
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
