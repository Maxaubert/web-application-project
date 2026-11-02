// Felles skjemadeler (#113). Godkjent av Max 10.10.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FieldError, PrimaryButton } from "./form-controls";

// #57: et klikk før React har lastet, sendte skjemaet uten handlingen, og feilmeldingen kom aldri. Godkjent av Max 02.11.
describe("PrimaryButton", () => {
  it("er låst i HTML-en fra serveren, også når ingenting sendes", () => {
    expect(renderToStaticMarkup(<PrimaryButton pending={false}>Fortsett</PrimaryButton>)).toContain('disabled=""');
  });
});

describe("FieldError", () => {
  it("feilmeldingen leses opp, og uten melding vises ingenting", () => {
    expect(renderToStaticMarkup(<FieldError id="e" message="Feil kode." />)).toContain('role="alert"');
    expect(renderToStaticMarkup(<FieldError id="e" />)).toBe("");
  });
});
