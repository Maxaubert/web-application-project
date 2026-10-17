// Knappene øverst til høyre (#133, #162, #193). Ikonknapper på mobil må fortsatt ha navn, så skjermlesere finner dem.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HeaderActions } from "./HeaderActions";

// Serverhandlingen trengs ikke for å tegne knappen; selve LogoutButton tegnes.
vi.mock("@/app/auth/actions", () => ({ logout: vi.fn() }));

describe("HeaderActions", () => {
  it("«Min side», «Legg ut annonse» og «Logg ut» har navn selv når mobilen bare viser ikoner", () => {
    const html = renderToStaticMarkup(<HeaderActions />);

    expect(html).toMatch(/<a href="\/me"[^>]*>[\s\S]*<span class="sr-only sm:not-sr-only[^"]*">Min side<\/span>/);
    expect(html).toMatch(/<a href="\/listings\/new"[^>]*>[\s\S]*<span class="sr-only sm:not-sr-only">Legg ut annonse<\/span>/);
    expect(html).toMatch(/<button[^>]*>[\s\S]*<span class="sr-only sm:not-sr-only">Logg ut<\/span>/);
    // Ikonene er pynt og skjules for skjermlesere.
    expect(html.match(/<svg[^>]*aria-hidden="true"/g)).toHaveLength(3);
  });

  it("«Min side» kommer først, så «Legg ut annonse», så «Logg ut»", () => {
    const html = renderToStaticMarkup(<HeaderActions />);

    expect(html.indexOf('href="/me"')).toBeLessThan(html.indexOf('href="/listings/new"'));
    expect(html.indexOf('href="/listings/new"')).toBeLessThan(html.indexOf("<button"));
  });

  it("knappen er markert som siden man står på, bare på den siden", () => {
    const newListing = renderToStaticMarkup(<HeaderActions current="new-listing" />);
    expect(newListing).toMatch(/<a href="\/listings\/new"[^>]*aria-current="page"/);
    expect(newListing).not.toMatch(/<a href="\/me"[^>]*aria-current/);

    const me = renderToStaticMarkup(<HeaderActions current="me" />);
    expect(me).toMatch(/<a href="\/me"[^>]*aria-current="page"/);
    expect(me).not.toMatch(/<a href="\/listings\/new"[^>]*aria-current/);

    expect(renderToStaticMarkup(<HeaderActions />)).not.toContain("aria-current");
  });
});
