"use client";
// Filtrene på forsiden (WF-03, #102). Desktop: kolonne til venstre. Mobil: «Filtre»-knapp som åpner
// et ark nedenfra. Feltene hører til søkeskjemaet via form-attributtet, så «Søk» og «Vis X annonser»
// sender søk og filtre sammen som én GET-adresse. Feltene er ukontrollerte: siden lastes på nytt.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { inputClass } from "@/app/shared/form-controls";
import { categoryLabels, conditionLabels, typeLabels } from "./labels";
import { showResultsLabel } from "./result-count";
import { PRICE_MAX } from "./search-limits";
import type { ListingFilters } from "./search-params";
import { SEARCH_FORM_ID } from "./SearchField";
import { useResultCount } from "./useResultCount";

// activeCount og count (treff nå) regnes ut på serveren, så denne filen slipper Zod og databaseskjemaet.
type FiltersProps = { q: string; filters: ListingFilters; activeCount: number; count: number | null };

// Verdiene hentes fra visningsnavnene; de har samme nøkler som databasens lister.
const entries = <K extends string>(labels: Record<K, string>) => Object.entries(labels) as [K, string][];

export function Filters({ q, filters, activeCount: active, count: initialCount }: FiltersProps) {
  const [open, setOpen] = useState(false);
  const count = useResultCount(SEARCH_FORM_ID, initialCount);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Fokus inn i arket når det åpnes, og tilbake til knappen når det lukkes.
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    toggleRef.current?.focus();
  }

  return (
    <div className="mt-4 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls="filters"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 items-center gap-2 rounded-md border-2 border-ink bg-surface px-5 text-lg font-semibold transition-colors hover:bg-paper lg:hidden"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-ink stroke-2">
          <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
        </svg>
        Filtre
        {active > 0 && (
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-ink px-1.5 text-sm text-white">
            {active}
            <span className="sr-only"> aktive</span>
          </span>
        )}
      </button>

      {open && <div aria-hidden="true" onClick={close} className="fixed inset-0 z-20 bg-ink/45 lg:hidden" />}

      <section
        id="filters"
        role={open ? "dialog" : undefined}
        aria-labelledby="filters-heading"
        onKeyDown={(event) => event.key === "Escape" && open && close()}
        className={`${open ? "fixed inset-x-0 top-[8vh] bottom-0 z-30 flex rounded-t-2xl bg-paper" : "hidden"} flex-col lg:static lg:z-auto lg:flex lg:rounded-none lg:bg-transparent`}
      >
        <div className="flex items-center justify-between border-b border-hairline px-4 py-2 lg:border-0 lg:p-0">
          <h2 id="filters-heading" className="text-xl font-bold">
            Filtre
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Lukk filtre"
            className="grid size-11 place-items-center rounded-md hover:bg-hairline/60 lg:hidden"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-none stroke-ink stroke-2">
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain p-4 lg:mt-5 lg:overflow-visible lg:p-0">
          <div>
            <label htmlFor="filter-category" className="mb-2 block font-semibold">
              Kategori
            </label>
            <select id="filter-category" name="category" form={SEARCH_FORM_ID} defaultValue={filters.category ?? ""} className={inputClass}>
              <option value="">Alle kategorier</option>
              {entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <CheckboxGroup legend="Handelstype">
            {entries(typeLabels).map(([value, label]) => (
              <Checkbox key={value} name="type" value={value} checked={filters.type.includes(value)} label={label} />
            ))}
          </CheckboxGroup>

          <fieldset>
            <legend className="mb-2 font-semibold">Pris</legend>
            <div className="flex items-end gap-2">
              <PriceField id="filter-min-price" name="minPrice" label="Fra kr" value={filters.minPrice} />
              <span aria-hidden="true" className="pb-3">
                –
              </span>
              <PriceField id="filter-max-price" name="maxPrice" label="Til kr" value={filters.maxPrice} />
            </div>
            <p className="mt-2 text-base text-muted">Ved lån gjelder prisen per uke.</p>
          </fieldset>

          <CheckboxGroup legend="Tilstand">
            {entries(conditionLabels).map(([value, label]) => (
              <Checkbox key={value} name="condition" value={value} checked={filters.condition.includes(value)} label={label} />
            ))}
          </CheckboxGroup>
        </div>

        <div className="flex items-center gap-4 border-t border-hairline bg-surface px-4 py-3 lg:mt-6 lg:flex-col-reverse lg:items-stretch lg:gap-2 lg:border-0 lg:bg-transparent lg:p-0">
          <a
            href={q ? `/?q=${encodeURIComponent(q)}` : "/"}
            className="inline-flex min-h-11 shrink-0 items-center justify-center underline hover:decoration-2"
          >
            Nullstill filtre
          </a>
          <button
            type="submit"
            form={SEARCH_FORM_ID}
            className="h-12 flex-1 rounded-md bg-action px-6 text-lg font-semibold text-white transition-colors hover:bg-action-hover lg:flex-none"
          >
            {showResultsLabel(count)}
          </button>
        </div>
      </section>
    </div>
  );
}

function CheckboxGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-1 font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-x-5 lg:flex-col">{children}</div>
    </fieldset>
  );
}

type CheckboxProps = { name: string; value: string; checked: boolean; label: string };

function Checkbox({ name, value, checked, label }: CheckboxProps) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-lg">
      <input type="checkbox" name={name} value={value} form={SEARCH_FORM_ID} defaultChecked={checked} className="size-5 accent-ink" />
      {label}
    </label>
  );
}

type PriceFieldProps = { id: string; name: string; label: string; value?: number };

function PriceField({ id, name, label, value }: PriceFieldProps) {
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="mb-1 block text-base text-muted">
        {label}
      </label>
      {/* Tekstfelt med tallastatur i stedet for type="number" (Max 10.10, #120): ingen pilknapper, og
          rulling over feltet endrer ikke verdien. Anbefalt av GOV.UK. Serveren validerer tallet. */}
      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={String(PRICE_MAX).length}
        form={SEARCH_FORM_ID}
        defaultValue={value}
        className={inputClass}
      />
    </div>
  );
}
