"use client";
// Knappene etter at en forespørsel er godtatt eller mens den venter (WF-08, #188): Bekreft overlevering, Avbestill og
// Trekk tilbake, og for eieren av et lån i bruk Bekreft retur (#214). Alle unntatt Bekreft overlevering åpner en
// bekreftelse (lokal tilstand), som Avslå i ResponseActions. Alle går til serverhandlingen updateRequest med valget i
// skjemafeltet «intent»; reglene ligger i handover.ts, withdraw.ts og return.ts.
import { useActionState, useState } from "react";
import { asFormState, type ActionResult } from "@/app/auth/form-state";
import { FieldError } from "@/app/shared/form-controls";
import { updateRequest } from "./actions";

type Mode = "idle" | "cancel" | "withdraw" | "return";
type HandoverActionsProps = { requestId: string; canConfirm: boolean; canCancel: boolean; canWithdraw: boolean; canReturn: boolean };

const secondary =
  "h-12 w-full rounded-md border-2 border-ink bg-surface text-base font-semibold enabled:hover:bg-paper disabled:cursor-wait disabled:opacity-70";
const primary =
  "h-14 w-full rounded-md bg-action text-lg font-semibold text-white transition-colors enabled:hover:bg-action-hover disabled:cursor-wait disabled:opacity-70";

const questions = {
  cancel: "Avbestille avtalen?",
  withdraw: "Trekke tilbake forespørselen?",
  return: "Bekrefte at lånet er levert tilbake?",
} as const;
const confirmLabels = { cancel: "Ja, avbestill", withdraw: "Ja, trekk tilbake", return: "Ja, bekreft retur" } as const;

export function HandoverActions({ requestId, canConfirm, canCancel, canWithdraw, canReturn }: HandoverActionsProps) {
  const [result, action, pending] = useActionState<ActionResult, FormData>(updateRequest, {});
  const state = asFormState(result);
  const [mode, setMode] = useState<Mode>("idle");

  return (
    <form action={action} noValidate>
      <input type="hidden" name="requestId" value={requestId} />
      <FieldError id="handover-error" message={state.error} />
      {/* Hver del har egen key, så React lager nye knapper: ellers blir «Avbestill» til «Ja, avbestill» midt i klikket, og klikket sender skjemaet. */}
      {mode === "idle" ? (
        <div key="idle" className="mt-3 space-y-3">
          {canConfirm && (
            <button type="submit" name="intent" value="confirm" disabled={pending} aria-busy={pending} className={primary}>
              Bekreft overlevering
            </button>
          )}
          {canCancel && (
            <button type="button" onClick={() => setMode("cancel")} className={secondary}>
              Avbestill
            </button>
          )}
          {canReturn && (
            <button type="button" onClick={() => setMode("return")} className={primary}>
              Bekreft retur
            </button>
          )}
          {canWithdraw && (
            <button type="button" onClick={() => setMode("withdraw")} className={secondary}>
              Trekk tilbake
            </button>
          )}
        </div>
      ) : (
        <div key={mode} className="mt-3 space-y-3 rounded-xl border-2 border-ink bg-surface p-4">
          <p className="text-lg font-bold">{questions[mode]}</p>
          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <button type="submit" name="intent" value={mode} disabled={pending} aria-busy={pending} className={primary}>
              {confirmLabels[mode]}
            </button>
            <button type="button" onClick={() => setMode("idle")} className="min-h-12 px-2 font-semibold underline">
              Avbryt
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
