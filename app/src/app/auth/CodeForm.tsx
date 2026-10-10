"use client";
// Steg 2: koden fra e-posten. «Send ny kode» og «Endre e-post» som i wireframes.
import { useActionState, useEffect } from "react";
import { FieldError, inputClass, PrimaryButton, TextField } from "@/app/shared/form-controls";
import { resendCode, verifyCode } from "./actions";
import { CODE_LENGTH } from "./constants";
import { asFormState, type ActionResult, type FormState } from "./form-state";

export function CodeForm({ devCode }: { devCode?: string }) {
  const [result, action, pending] = useActionState<ActionResult, FormData>(verifyCode, {});
  const state = asFormState(result);
  const [resend, resendAction, resending] = useActionState<FormState & { sent?: boolean }, FormData>(
    async () => {
      const sent = asFormState(await resendCode());
      return sent.error ? sent : { sent: true, devCode: sent.devCode };
    },
    {},
  );

  // Bare lokal utvikling: koden sendes hit bare når den skrives til terminalen (LOGIN_CODE_DELIVERY=log).
  const latestDevCode = resend.devCode ?? devCode;
  useEffect(() => {
    if (latestDevCode) console.info(`Innloggingskode (bare lokal utvikling): ${latestDevCode}`);
  }, [latestDevCode]);

  return (
    <div className="space-y-6">
      <form action={action} noValidate className="space-y-5">
        <TextField
          id="code"
          name="code"
          label="Kode"
          autoComplete="one-time-code"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={CODE_LENGTH + 2}
          required
          className={`${inputClass} h-14 text-center text-2xl tracking-[0.4em] tabular-nums`}
          error={state.fieldErrors?.code}
        />
        <PrimaryButton pending={pending}>{pending ? "Logger inn …" : "Logg inn"}</PrimaryButton>
      </form>

      <div className="flex items-center justify-between">
        <form action={resendAction}>
          <button
            type="submit"
            disabled={resending}
            className="min-h-11 text-base underline enabled:hover:decoration-2 disabled:cursor-wait disabled:opacity-70"
          >
            {resending ? "Sender …" : "Send ny kode"}
          </button>
        </form>
        <a href="/login" className="inline-flex min-h-11 items-center text-base underline hover:decoration-2">
          Endre e-post
        </a>
      </div>
      <div role="status" aria-live="polite">
        {resend.sent && <p className="text-base">En ny kode er sendt.</p>}
      </div>
      <FieldError id="resend-error" message={resend.error} />
    </div>
  );
}
