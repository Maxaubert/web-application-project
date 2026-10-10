// Søkefeltet på forsiden (WF-03, #97). Et vanlig GET-skjema: søket havner i adressen (?q=),
// så det virker uten JavaScript, kan deles som lenke, og tilbakeknappen virker.
import { inputClass } from "@/app/shared/form-controls";
import { SEARCH_MAX_LENGTH } from "./search-params";

export function SearchField({ q }: { q: string }) {
  return (
    <form method="get" action="/" role="search" className="mt-6 max-w-3xl">
      <label htmlFor="q" className="block text-base font-semibold">
        Søk i tittel, beskrivelse og selger
      </label>
      <div className="mt-2 flex gap-3">
        <input id="q" name="q" type="search" defaultValue={q} maxLength={SEARCH_MAX_LENGTH} className={inputClass} />
        <button
          type="submit"
          className="h-12 shrink-0 rounded-md bg-action px-6 text-lg font-semibold text-white transition-colors hover:bg-action-hover"
        >
          Søk
        </button>
      </div>
    </form>
  );
}
