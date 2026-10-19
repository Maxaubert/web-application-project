// Meldingen etter et svar (#203). Tidtakeren og fjerningen av ?sendt= skjer i nettleseren og dekkes av e2e-testen;
// her sjekkes det som tegnes på serveren: meldingen som en statusregion, og at den ikke fanger klikk.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TOAST_MS, Toast } from "./Toast";

describe("Toast", () => {
  const html = renderToStaticMarkup(<Toast message="Motbud sendt: 240 kr" />);

  it("viser meldingen i en statusregion, så skjermlesere leser den opp", () => {
    expect(html).toMatch(/<div role="status"[^>]*>[\s\S]*Motbud sendt: 240 kr/);
  });

  it("ligger over innholdet uten å ta imot klikk, og haken er pynt", () => {
    expect(html).toMatch(/<div role="status" class="[^"]*pointer-events-none[^"]*fixed[^"]*"/);
    expect(html).toMatch(/<span aria-hidden="true"[^>]*>✓<\/span>/);
  });

  it("står i 5 sekunder", () => {
    expect(TOAST_MS).toBe(5000);
  });
});
