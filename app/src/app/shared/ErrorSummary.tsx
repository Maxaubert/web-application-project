"use client";
// Feilboksen øverst i et skjema (WF-05, `Legg-ut-feil-*`): alle feilene som lenker til feltet. Får fokus når
// den dukker opp etter innsending, så tastatur- og skjermleserbrukere havner rett på den. Mønsteret fra GOV.UK.
import { useEffect, useRef } from "react";

// action er det brukeren prøvde å gjøre, for overskriften: «Rett 2 feil før du publiserer».
// fieldIds gir også rekkefølgen, så feilene står i samme rekkefølge som feltene i skjemaet.
type Props = { errors: Record<string, string>; fieldIds: Record<string, string>; action: string };

export function ErrorSummary({ errors, fieldIds, action }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const entries = Object.keys(fieldIds)
    .filter((field) => errors[field])
    .map((field) => [field, errors[field]] as const);

  useEffect(() => {
    if (entries.length > 0) ref.current?.focus();
  }, [errors, entries.length]);

  if (entries.length === 0) return null;
  return (
    <div ref={ref} tabIndex={-1} aria-labelledby="error-summary-title" className="rounded-lg border-2 border-danger bg-surface px-5 py-4 outline-none">
      <h2 id="error-summary-title" className="text-lg font-bold">
        Rett {entries.length} feil før du {action}
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {entries.map(([field, message]) => (
          <li key={field}>
            <a href={`#${fieldIds[field]}`} className="font-semibold text-danger underline hover:decoration-2">
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
