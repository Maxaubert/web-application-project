"use client";
// Kontooppsett første gang: fullt navn, land og telefon (FK-01). E-posten er låst.
import { useActionState } from "react";
import { PrimaryButton, TextField } from "@/app/shared/form-controls";
import { completeAccount } from "./actions";
import type { CountryOption } from "./phone";
import { PhoneField } from "./PhoneField";
import { asFormState, type ActionResult } from "./form-state";

type Props = { email: string; countries: CountryOption[] };

export function AccountSetupForm({ email, countries }: Props) {
  const [result, action, pending] = useActionState<ActionResult, FormData>(completeAccount, {});
  const state = asFormState(result);
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};
  return (
    <form action={action} noValidate className="space-y-5">
      <TextField id="account-email" label="E-post" value={email} readOnly />
      <TextField id="name" name="name" label="Fullt navn" autoComplete="name" required defaultValue={values.name} error={errors.name} />
      <PhoneField
        countries={countries}
        defaultCountry={values.country || "NO"}
        defaultPhone={values.phone}
        countryError={errors.country}
        phoneError={errors.phone}
      />
      <PrimaryButton pending={pending}>{pending ? "Lagrer …" : "Fullfør"}</PrimaryButton>
    </form>
  );
}
