"use client";
// Steg 1: HiØ-e-post. Serveren (requestCode) avgjør om adressen godtas.
import { useActionState } from "react";
import { PrimaryButton, TextField } from "@/app/shared/form-controls";
import { requestCode } from "./actions";
import { asFormState, type ActionResult } from "./form-state";

export function LoginForm() {
  const [result, action, pending] = useActionState<ActionResult, FormData>(requestCode, {});
  const state = asFormState(result);
  return (
    <form action={action} noValidate className="space-y-5">
      <TextField
        id="email"
        name="email"
        type="email"
        label="HiØ-e-post"
        placeholder="navn@hiof.no"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <PrimaryButton pending={pending}>{pending ? "Sender kode …" : "Fortsett"}</PrimaryButton>
    </form>
  );
}
