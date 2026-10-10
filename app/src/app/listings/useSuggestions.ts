// Henter søkeforslag mens brukeren skriver (#104): venter DEBOUNCE_MS etter siste tastetrykk, og
// avbryter eldre forespørsler, så et sent svar for «cas» aldri overskriver svaret for «casi».
// Feil og utløpt økt gir ingen forslag; skjemaet virker da som før.
import { useEffect, useState } from "react";
import { DEBOUNCE_MS, suggestionsUrl, type Suggestion } from "./suggestions";

type Result = { url: string; hits: Suggestion[] };

export function useSuggestions(q: string) {
  const url = suggestionsUrl(q);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        const hits = response.ok ? ((await response.json()) as { listings: Suggestion[] }).listings : [];
        setResult({ url, hits });
      } catch {
        // Avbrutt eller nettverksfeil: ingen nye forslag.
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [url]);

  // Mens neste svar lastes vises de forrige forslagene; «current» sier om de hører til søkeordet nå.
  if (!url || !result) return { hits: [], current: false };
  return { hits: result.hits, current: result.url === url };
}
