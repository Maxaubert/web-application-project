"use client";
// Telefon på én rad (Max 05.10): rundt flagg og pil, skillelinje, landskode og nummer.
// Nedtrekkslisten er nettleserens egen <select>, lagt usynlig over flagget, så tastatur og
// skjermleser virker som vanlig. Lista viser flagg-fritt navn og kode, f.eks. «Norge +47».
import { useState } from "react";
import { FieldError } from "@/app/shared/form-controls";
import { flagUrl } from "@/app/shared/flags";
import type { CountryOption } from "./phone";

type Props = {
  countries: CountryOption[];
  defaultCountry: string;
  defaultPhone?: string;
  countryError?: string;
  phoneError?: string;
};

export function PhoneField({ countries, defaultCountry, defaultPhone, countryError, phoneError }: Props) {
  const [country, setCountry] = useState(defaultCountry);
  const selected = countries.find((c) => c.code === country) ?? countries[0];
  const flag = flagUrl(selected.code);
  const error = phoneError ?? countryError;

  return (
    <div className="space-y-2">
      <label htmlFor="phone" className="block text-base font-semibold">
        Telefonnummer
      </label>
      <div
        className={
          "flex h-12 w-full items-stretch rounded-md border bg-surface focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-focus " +
          (error ? "border-2 border-danger" : "border-line")
        }
      >
        <div className="relative flex shrink-0 items-center gap-1.5 border-r border-hairline pr-2 pl-3">
          <img src={flag} alt="" width={24} height={24} className="size-6 rounded-full" />
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 text-muted" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M5 6l3-3 3 3M5 10l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <select
            name="country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            aria-label="Landskode"
            aria-invalid={countryError ? true : undefined}
            aria-describedby={countryError ? "phone-error" : undefined}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} {c.dialCode}
              </option>
            ))}
          </select>
        </div>
        <span aria-hidden="true" className="flex items-center pl-3 text-lg text-muted tabular-nums">
          {selected.dialCode}
        </span>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel-national"
          inputMode="tel"
          required
          defaultValue={defaultPhone}
          aria-invalid={phoneError ? true : undefined}
          aria-describedby={error ? "phone-error" : undefined}
          className="min-w-0 flex-1 rounded-r-md bg-transparent px-2 text-lg text-ink outline-none"
        />
      </div>
      <FieldError id="phone-error" message={error} />
    </div>
  );
}
