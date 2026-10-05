"use client";
// Kontooppsett første gang: fullt navn, land og telefon (FK-01). E-posten er låst.
import { useActionState } from "react";
import { FieldError, PrimaryButton, selectClass, TextField } from "@/app/shared/form-controls";
import { completeAccount } from "./actions";
import { asFormState, type ActionResult } from "./form-state";

type Props = { email: string; countries: { code: string; name: string }[] };

export function AccountSetupForm({ email, countries }: Props) {
  const [result, action, pending] = useActionState<ActionResult, FormData>(completeAccount, {});
  const state = asFormState(result);
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};
  return (
    <form action={action} noValidate className="space-y-5">
      <TextField id="account-email" label="E-post" value={email} readOnly />
      <TextField id="name" name="name" label="Fullt navn" autoComplete="name" required defaultValue={values.name} error={errors.name} />
      <div className="space-y-2">
        <label htmlFor="country" className="block text-base font-semibold">
          Land for telefonnummeret
        </label>
        <select
          id="country"
          name="country"
          key={values.country ?? "NO"}
          defaultValue={values.country || "NO"}
          className={selectClass}
          aria-invalid={errors.country ? true : undefined}
          aria-describedby={errors.country ? "country-error" : undefined}
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <FieldError id="country-error" message={errors.country} />
      </div>
      <TextField
        id="phone"
        name="phone"
        type="tel"
        label="Telefonnummer"
        autoComplete="tel-national"
        inputMode="tel"
        required
        defaultValue={values.phone}
        error={errors.phone}
      />
      <PrimaryButton pending={pending}>{pending ? "Lagrer …" : "Fullfør"}</PrimaryButton>
    </form>
  );
}
