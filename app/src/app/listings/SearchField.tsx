"use client";
// Søkefeltet på forsiden (WF-03, #97) med live forslag mens man skriver (#104). Fortsatt et vanlig
// GET-skjema: uten JavaScript, ved Enter uten markering og ved «Søk» går det til /?q= som før.
// Forslagene følger WAI-ARIA-mønsteret for combobox med listbox: piltaster, Enter og Escape.
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { navigate } from "rwsdk/client";
import { inputClass } from "@/app/shared/form-controls";
import { formatTypeAndPrice } from "./format-type-and-price";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { SEARCH_MAX_LENGTH } from "./search-limits";
import { searchPageUrl } from "./search-url";
import { moveActive, suggestionsUrl } from "./suggestions";
import { useSuggestions } from "./useSuggestions";

// Filtrene i sidekolonnen hører til dette skjemaet via form-attributtet, så «Søk» tar dem med (#102).
export const SEARCH_FORM_ID = "listing-search";

export function SearchField({ q }: { q: string }) {
  const [value, setValue] = useState(q);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const { hits, current } = useSuggestions(value);
  const formRef = useRef<HTMLFormElement>(null);
  const listId = useId();

  const term = value.trim();
  const fetching = suggestionsUrl(value) !== null;
  // Ingen treff gir ingen boks (Max 10.10). Siste rad er «Vis alle treff».
  const showList = open && fetching && hits.length > 0;
  const rowCount = hits.length + 1;
  const optionId = (index: number) => `${listId}-${index}`;

  function close() {
    setOpen(false);
    setActive(-1);
  }

  function choose(index: number) {
    if (index < hits.length) window.location.assign(`/listings/${hits[index].id}`);
    else formRef.current?.requestSubmit();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") return close();
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!showList) return setOpen(true);
      event.preventDefault();
      setActive(moveActive(active, event.key === "ArrowDown" ? 1 : -1, rowCount));
    } else if (event.key === "Enter" && showList && active >= 0) {
      event.preventDefault();
      choose(active);
    }
  }

  return (
    <form
      ref={formRef}
      id={SEARCH_FORM_ID}
      method="get"
      action="/"
      role="search"
      // Ryddig adresse uten tomme filterfelt (#102), hentet uten full omlasting (#122). Uten JavaScript
      // sender nettleseren skjemaet som før.
      onSubmit={(event) => {
        event.preventDefault();
        void navigate(searchPageUrl(new FormData(event.currentTarget)), { info: { scrollToTop: false } });
      }}
      className="mt-6 max-w-3xl"
    >
      <label htmlFor="q" className="block text-base font-semibold">
        Søk i tittel, beskrivelse og selger
      </label>
      <div className="mt-2 flex gap-3">
        <div className="relative min-w-0 flex-1">
          <input
            id="q"
            name="q"
            type="search"
            value={value}
            maxLength={SEARCH_MAX_LENGTH}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={listId}
            aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
            onChange={(event) => {
              setValue(event.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onKeyDown={onKeyDown}
            onBlur={close}
            className={inputClass}
          />
          <ul
            id={listId}
            role="listbox"
            aria-label="Søkeforslag"
            hidden={!showList}
            className="absolute inset-x-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-hairline bg-surface shadow-[0_12px_32px_-12px_rgb(29_27_24/0.35)] transition-opacity duration-150 ease-out starting:opacity-0"
          >
            {hits.map((hit, index) => (
              <li
                key={hit.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === active}
                // Beholder fokus i feltet, så klikket ikke lukker listen før det er registrert.
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(index)}
                className="flex min-h-14 items-center gap-3 px-3 py-2 aria-selected:bg-hairline/60 aria-selected:shadow-[inset_4px_0_0_var(--color-ink)]"
              >
                <ImagePlaceholder className="size-11 shrink-0 rounded-md" iconClassName="size-5" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{hit.title}</span>
                  <span className="block text-base text-muted">{formatTypeAndPrice(hit)}</span>
                </span>
              </li>
            ))}
            <li
              id={optionId(hits.length)}
              role="option"
              aria-selected={active === hits.length}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(hits.length)}
              onClick={() => choose(hits.length)}
              className="flex min-h-12 items-center justify-between gap-3 border-t border-hairline px-4 font-semibold aria-selected:bg-hairline/60 aria-selected:shadow-[inset_4px_0_0_var(--color-ink)]"
            >
              <span className="min-w-0 truncate">Vis alle treff for «{term}»</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0 fill-none stroke-ink stroke-2">
                <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </li>
          </ul>
        </div>
        <button
          type="submit"
          className="h-12 shrink-0 rounded-md bg-action px-6 text-lg font-semibold text-white transition-colors enabled:hover:bg-action-hover"
        >
          Søk
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {open && fetching && current ? (hits.length > 0 ? `${hits.length} forslag` : "Ingen forslag") : ""}
      </p>
    </form>
  );
}
