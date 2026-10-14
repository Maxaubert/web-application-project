// Knappene øverst til høyre (#133, #162). Ikonknapper på mobil må fortsatt ha navn, så skjermlesere finner dem.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HeaderActions } from "./HeaderActions";

// Serverhandlingen trengs ikke for å tegne knappen; selve LogoutButton tegnes.
vi.mock("@/app/auth/actions", () => ({ logout: vi.fn() }));

describe("HeaderActions", () => {
  it("«Legg ut annonse» og «Logg ut» har navn selv når mobilen bare viser ikoner", () => {
    const html = renderToStaticMarkup(<HeaderActions />);

    expect(html).toMatch(/<a href="\/listings\/new"[^>]*>[\s\S]*<span class="sr-only sm:not-sr-only">Legg ut annonse<\/span>/);
    expect(html).toMatch(/<button[^>]*>[\s\S]*<span class="sr-only sm:not-sr-only">Logg ut<\/span>/);
    // Ikonene er pynt og skjules for skjermlesere.
    expect(html.match(/<svg[^>]*aria-hidden="true"/g)).toHaveLength(2);
  });

  it("knappen er markert som siden man står på, bare på «Legg ut annonse»", () => {
    expect(renderToStaticMarkup(<HeaderActions current="new-listing" />)).toContain('aria-current="page"');
    expect(renderToStaticMarkup(<HeaderActions />)).not.toContain("aria-current");
  });
});
