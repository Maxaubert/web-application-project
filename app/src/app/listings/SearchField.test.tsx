// Søkefeltet på forsiden (#97, #164). På mobil skjules etiketten og knappen visuelt, så begge må finnes i
// HTML-en for skjermlesere og for Enter.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SearchField } from "./SearchField";

vi.mock("rwsdk/client", () => ({ navigate: vi.fn() }));

describe("SearchField", () => {
  const html = renderToStaticMarkup(<SearchField q="" />);

  it("har etikett, søkeknapp og søketast på tastaturet selv når mobilen skjuler dem", () => {
    expect(html).toMatch(/<label for="q"[^>]*>Søk i tittel, beskrivelse og selger<\/label>/);
    expect(html).toMatch(/<button type="submit"[^>]*>Søk<\/button>/);
    expect(html).toContain('enterKeyHint="search"');
  });

  it("forstørrelsesglasset er pynt og skjules for skjermlesere", () => {
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"[^>]*>\s*<circle/);
  });
});
