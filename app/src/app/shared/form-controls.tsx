// Felles skjemadeler: etikett, felt og feilmelding henger sammen via id-er (DK-03, WCAG).
import type { InputHTMLAttributes, ReactNode } from "react";

// Fokus: tekstfelt får fokus også ved klikk, så den tykke blå rammen ble tung (Max 10.10, #113). I stedet blir
// feltets egen kant mørk og tykkere, som fortsatt er synlig for tastaturbrukere (WCAG 2.4.7). Som klasser
// her, fordi en regel i styles.css taper mot border-line.
export const inputClass =
  "block h-12 w-full rounded-md border border-line bg-surface px-4 text-lg text-ink placeholder:text-muted " +
  "focus-visible:border-ink focus-visible:shadow-[0_0_0_1px_var(--color-ink)] focus-visible:outline-none " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:border-2";
// Låste felt (som e-posten i kontooppsettet) vises stiplet, som i wireframes.
const fieldClass = inputClass + " read-only:border-dashed read-only:bg-paper";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; error?: string };

export function TextField({ id, label, error, ...input }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-base font-semibold">
        {label}
      </label>
      <input
        id={id}
        className={fieldClass}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...input}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    // role="alert": skjermlesere leser feilen opp når den dukker opp etter innsending (#113).
    <p id={id} role="alert" className="text-base font-medium text-danger">
      {message}
    </p>
  );
}

export function PrimaryButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="h-12 w-full rounded-md bg-action text-lg font-semibold text-white transition-colors enabled:hover:bg-action-hover disabled:cursor-wait disabled:opacity-70"
    >
      {children}
    </button>
  );
}
