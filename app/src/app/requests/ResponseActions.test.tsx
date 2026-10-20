// Knappene under budkortet (#187), slik de ser ut før noe er trykket: Godta er en sendeknapp med handlingen i
// skjemaet, Motbud og Avslå åpner hver sin del og sender ikke noe. Åpningen selv (klikk) dekkes av nettlesertesten.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ResponseActions } from "./ResponseActions";

vi.mock("./actions", () => ({ respondToRequest: vi.fn() }));

describe("ResponseActions", () => {
  const html = renderToStaticMarkup(<ResponseActions requestId="r1" offerId="o1" />);

  it("Godta sender skjemaet med handlingen «accept», og er den første knappen", () => {
    expect(html).toMatch(/<button type="submit"(?=[^>]*name="intent")(?=[^>]*value="accept")[^>]*>Godta<\/button>/);
    expect(html.indexOf(">Godta<")).toBeLessThan(html.indexOf(">Motbud<"));
    expect(html.indexOf(">Motbud<")).toBeLessThan(html.indexOf(">Avslå<"));
  });

  it("Motbud og Avslå er vanlige knapper som ikke sender skjemaet", () => {
    expect(html).toMatch(/<button type="button"[^>]*>Motbud<\/button>/);
    expect(html).toMatch(/<button type="button"[^>]*>Avslå<\/button>/);
  });

  it("prisfeltet og bekreftelsen er skjult til man trykker, og det er ingen forklaringstekst", () => {
    expect(html).not.toContain("counter-price");
    expect(html).not.toContain("Avslå forespørselen?");
    expect(html).not.toContain('value="decline"');
    expect(html).not.toContain('value="counter"');
  });

  it("sender forespørselen og forslaget som skjulte felt", () => {
    expect(html).toContain('<input type="hidden" name="requestId" value="r1"/>');
    expect(html).toContain('<input type="hidden" name="offerId" value="o1"/>');
  });

  it("en gis bort har bare Godta og Avslå, uten Motbud (#208)", () => {
    const giveaway = renderToStaticMarkup(<ResponseActions requestId="r1" offerId="o1" type="giveaway" />);

    expect(giveaway).toContain(">Godta</button>");
    expect(giveaway).toContain(">Avslå</button>");
    expect(giveaway).not.toContain("Motbud");
  });

  it("et lån har Godta, Motbud og Avslå, og ingen periodefelt før Motbud trykkes (#208)", () => {
    const loan = renderToStaticMarkup(<ResponseActions requestId="r1" offerId="o1" type="loan" weeklyPrice={60} />);

    for (const text of ["Godta", "Motbud", "Avslå"]) expect(loan).toContain(`>${text}</button>`);
    expect(loan).not.toMatch(/type="date"|Fra|Til/);
  });
});
