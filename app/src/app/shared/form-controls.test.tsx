// Felles skjemadeler (#113). Godkjent av Max 10.10.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FieldError } from "./form-controls";

describe("FieldError", () => {
  it("feilmeldingen leses opp, og uten melding vises ingenting", () => {
    expect(renderToStaticMarkup(<FieldError id="e" message="Feil kode." />)).toContain('role="alert"');
    expect(renderToStaticMarkup(<FieldError id="e" />)).toBe("");
  });
});
