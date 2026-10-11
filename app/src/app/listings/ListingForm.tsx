"use client";
// Skjemaet for «Legg ut annonse» (FK-03, mockup 13, #133). Feltene er kontrollerte, så forhåndsvisningen
// over skjemaet følger med mens man skriver. Alt valideres på nytt i serverhandlingen createListing (#131).
import { startTransition, useActionState, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { asFormState, type ActionResult } from "@/app/auth/form-state";
import { ErrorSummary } from "@/app/shared/ErrorSummary";
import { FieldError, inputClass } from "@/app/shared/form-controls";
import { createListing } from "./actions";
import { categoryLabels, conditionLabels, typeLabels } from "./labels";
import type { ListingFormValues } from "./listing-schema";
import { ListingPreview } from "./ListingPreview";

const EMPTY: ListingFormValues = { title: "", description: "", category: "", type: "sale", condition: "", price: "" };

// Feltet hver feil lenker til fra feilboksen. Radioknappene lenker til første valg.
const FIELD_IDS: Record<string, string> = {
  title: "listing-title",
  description: "listing-description",
  category: "listing-category",
  type: "listing-type-sale",
  price: "listing-price",
  condition: "listing-condition-new",
};

const PRICE_TEXT = {
  sale: { label: "Pris (kr)", hint: "Hele kroner." },
  loan: { label: "Pris per uke (kr, valgfri)", hint: "Tomt betyr gratis lån." },
};

const entries = <K extends string>(labels: Record<K, string>) => Object.entries(labels) as [K, string][];

export function ListingForm() {
  const [result, action, pending] = useActionState<ActionResult, FormData>(createListing, {});
  const errors = asFormState(result).fieldErrors ?? {};
  const [values, setValues] = useState(EMPTY);

  const set = (key: keyof ListingFormValues) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setValues({ ...values, [key]: event.target.value });
  // aria-invalid gir rød kant (inputClass), og aria-describedby kobler feilen til feltet.
  // Sender skjemaet selv i stedet for action={action}: React 19 tilbakestiller ellers skjemaet etter
  // handlingen, og da hoppet radioknappene tilbake til standardvalget mens resten sto igjen.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  }
  const invalid = (key: string) => (errors[key] ? { "aria-invalid": true, "aria-describedby": `${key}-error` } : {});

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      <ErrorSummary errors={errors} fieldIds={FIELD_IDS} action="publiserer" />
      {/* Fra 1024 px: forhåndsvisningen til venstre, som blir stående mens man ruller, og feltene til høyre (#135). */}
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
        <div className="lg:sticky lg:top-6">
          <ListingPreview values={values} />
        </div>

        {/* @container: de små feltene står parvis når feltkolonnen er bred nok. */}
        <div className="@container mt-8 space-y-8 lg:mt-0">
          <Field id="listing-title" label="Tittel" error={errors.title} errorId="title-error" hint="3–80 tegn.">
            <input id="listing-title" name="title" value={values.title} onChange={set("title")} maxLength={80} className={inputClass} {...invalid("title")} />
          </Field>

          <Field id="listing-description" label="Beskrivelse" error={errors.description} errorId="description-error" hint="Nevn eventuelle skader.">
            <textarea
              id="listing-description"
              name="description"
              rows={5}
              value={values.description}
              onChange={set("description")}
              maxLength={2000}
              className={`${inputClass} h-auto py-3 leading-relaxed`}
              {...invalid("description")}
            />
          </Field>

          <div className="grid gap-8 @3xl:grid-cols-2">
            <Field id="listing-category" label="Kategori" error={errors.category} errorId="category-error">
              <select id="listing-category" name="category" value={values.category} onChange={set("category")} className={inputClass} {...invalid("category")}>
                <option value="">Velg kategori</option>
                {entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <RadioGroup name="type" legend="Handelstype" idPrefix="listing-type" options={entries(typeLabels)} value={values.type} onChange={set("type")} error={errors.type} />
          </div>

          <div className="grid gap-8 @3xl:grid-cols-2">
            {values.type === "giveaway" ? (
              <div>
                <p className="mb-2 font-semibold">Pris</p>
                <p className="rounded-md bg-hairline/40 px-4 py-3 text-muted">Gis bort er alltid gratis.</p>
              </div>
            ) : (
              <Field id="listing-price" label={PRICE_TEXT[values.type === "loan" ? "loan" : "sale"].label} error={errors.price} errorId="price-error" hint={PRICE_TEXT[values.type === "loan" ? "loan" : "sale"].hint}>
                <input
                  id="listing-price"
                  name="price"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={values.price}
                  onChange={set("price")}
                  className={`${inputClass} sm:max-w-72`}
                  {...invalid("price")}
                />
              </Field>
            )}

            <RadioGroup name="condition" legend="Tilstand" idPrefix="listing-condition" options={entries(conditionLabels)} value={values.condition} onChange={set("condition")} error={errors.condition} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={pending}
              aria-busy={pending}
              className="h-12 rounded-md bg-action px-6 text-lg font-semibold text-white transition-colors enabled:hover:bg-action-hover disabled:cursor-wait disabled:opacity-70"
            >
              {pending ? "Publiserer …" : "Publiser annonse"}
            </button>
            <a href="/" className="inline-flex h-12 items-center justify-center rounded-md border-2 border-ink bg-surface px-6 text-lg font-semibold transition-colors hover:bg-paper">
              Avbryt
            </a>
          </div>
        </div>
      </div>
    </form>
  );
}

type FieldProps = { id: string; label: string; error?: string; errorId: string; hint?: string; children: ReactNode };

// Etikett, feilen over feltet (som i WF-05) og hint under.
function Field({ id, label, error, errorId, hint, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-semibold">
        {label}
      </label>
      <FieldError id={errorId} message={error} />
      {children}
      {hint && <p className="text-base text-muted">{hint}</p>}
    </div>
  );
}

type RadioGroupProps = {
  name: string;
  legend: string;
  idPrefix: string;
  options: [string, string][];
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
};

function RadioGroup({ name, legend, idPrefix, options, value, onChange, error }: RadioGroupProps) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-2 font-semibold">{legend}</legend>
      <FieldError id={`${name}-error`} message={error} />
      <div className="flex flex-wrap gap-x-7">
        {options.map(([optionValue, label]) => (
          <label key={optionValue} className="flex min-h-11 cursor-pointer items-center gap-3 text-lg">
            <input
              id={`${idPrefix}-${optionValue}`}
              type="radio"
              name={name}
              value={optionValue}
              checked={value === optionValue}
              onChange={onChange}
              aria-invalid={error ? true : undefined}
              className="size-5 accent-ink"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
