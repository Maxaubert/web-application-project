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
  // Feltet beskrives av hintet, feilen og telleren som finnes, i den rekkefølgen de står på skjermen.
  const describe = (id: string, key: string, parts: { hint?: boolean; count?: boolean }) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": [parts.hint && `${id}-hint`, errors[key] && `${key}-error`, parts.count && `${id}-count`].filter(Boolean).join(" ") || undefined,
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col space-y-8">
      <ErrorSummary errors={errors} fieldIds={FIELD_IDS} action="publiserer" />
      {/* Fra 1024 px: forhåndsvisningen til venstre, som blir stående mens man ruller, og feltene til høyre (#135). */}
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
        <div className="lg:sticky lg:top-6">
          <ListingPreview values={values} />
        </div>

        {/* @container: de små feltene står parvis når feltkolonnen er bred nok. */}
        <div className="@container mt-8 space-y-8 lg:mt-0">
          <Field id="listing-title" label="Tittel" error={errors.title} errorId="title-error" hint="Minst 3 tegn." count={{ length: values.title.length, max: 80 }}>
            <input
              id="listing-title"
              name="title"
              value={values.title}
              onChange={set("title")}
              maxLength={80}
              className={inputClass}
              {...describe("listing-title", "title", { hint: true, count: true })}
            />
          </Field>

          <Field
            id="listing-description"
            label="Beskrivelse"
            error={errors.description}
            errorId="description-error"
            hint="Nevn eventuelle skader."
            count={{ length: values.description.length, max: 2000 }}
          >
            <textarea
              id="listing-description"
              name="description"
              rows={5}
              value={values.description}
              onChange={set("description")}
              maxLength={2000}
              className={`${inputClass} h-auto resize-none py-3 leading-relaxed`}
              {...describe("listing-description", "description", { hint: true, count: true })}
            />
          </Field>

          <div className="grid gap-8 @3xl:grid-cols-2">
            <Field id="listing-category" label="Kategori" error={errors.category} errorId="category-error">
              <select id="listing-category" name="category" value={values.category} onChange={set("category")} className={inputClass} {...describe("listing-category", "category", {})}>
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
                  {...describe("listing-price", "price", { hint: true })}
                />
              </Field>
            )}

            <RadioGroup name="condition" legend="Tilstand" idPrefix="listing-condition" options={entries(conditionLabels)} value={values.condition} onChange={set("condition")} error={errors.condition} />
          </div>

        </div>
      </div>

      {/* Knappene nederst til høyre i kortet, «Avbryt» til venstre for «Publiser annonse» (Max 11.10, #135).
          På mobil under hverandre med «Publiser annonse» øverst. */}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:mt-auto sm:flex-row sm:justify-end sm:pt-10">
        <a href="/" className="inline-flex h-12 items-center justify-center rounded-md border-2 border-ink bg-surface px-6 text-lg font-semibold transition-colors hover:bg-paper">
          Avbryt
        </a>
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="h-12 rounded-md bg-action px-6 text-lg font-semibold text-white transition-colors enabled:hover:bg-action-hover disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Publiserer …" : "Publiser annonse"}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  errorId: string;
  hint?: string;
  count?: { length: number; max: number };
  children: ReactNode;
};

// Etikett, hint og feil over feltet, og teller under (Max 11.10, #135). Hint før feil, som hos GOV.UK.
function Field({ id, label, error, errorId, hint, count, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-semibold">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-base text-muted">
          {hint}
        </p>
      )}
      <FieldError id={errorId} message={error} />
      {children}
      {count && (
        <p id={`${id}-count`} className="text-base text-muted tabular-nums">
          {count.length} av {count.max} tegn
        </p>
      )}
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
