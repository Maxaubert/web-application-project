// Holder tallet på «Vis X annonser» oppdatert mens brukeren endrer søk eller filtre (#102). Lytter på
// input-hendelser fra søkeskjemaet, venter DEBOUNCE_MS og spør GET /api/listings med de samme verdiene.
// Eldre forespørsler avbrytes, som i useSuggestions. Feil eller 400 gir null, altså «Vis annonser».
import { useEffect, useState } from "react";
import { countUrl } from "./search-url";
import { DEBOUNCE_MS } from "./suggestions";

export function useResultCount(formId: string, initial: number | null) {
  const [url, setUrl] = useState<string | null>(null);
  const [count, setCount] = useState(initial);

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) return;
    // Feltene i filterkolonnen ligger utenfor <form>, men hører til den via form-attributtet,
    // så hendelsen fanges på dokumentet og sjekkes mot skjemaet.
    function onInput(event: Event) {
      const field = event.target as HTMLInputElement;
      if (field.form === form) setUrl(countUrl(new FormData(form as HTMLFormElement)));
    }
    document.addEventListener("input", onInput);
    return () => document.removeEventListener("input", onInput);
  }, [formId]);

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        setCount(response.ok ? ((await response.json()) as { listings: unknown[] }).listings.length : null);
      } catch {
        // Avbrutt av en nyere endring: den nye forespørselen setter tallet.
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [url]);

  return count;
}
