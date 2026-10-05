// Felles skjemadeler: etikett, felt og feilmelding henger sammen via id-er (DK-03, WCAG).
import type { InputHTMLAttributes, ReactNode } from "react";

const baseClass =
  "block h-12 w-full rounded-md border border-line bg-surface px-4 text-lg text-ink placeholder:text-muted " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:border-2";
// Låste felt (som e-posten i kontooppsettet) vises stiplet, som i wireframes.
const fieldClass = baseClass + " read-only:border-dashed read-only:bg-paper";

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
    <p id={id} className="text-base font-medium text-danger">
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
      className="h-12 w-full rounded-md bg-action text-lg font-semibold text-white transition-colors hover:bg-action-hover disabled:cursor-wait disabled:opacity-70"
    >
      {children}
    </button>
  );
}

// Nedtrekkslister regnes som «read-only» i CSS, så de får ikke den låste stilen.
export const selectClass = baseClass;
