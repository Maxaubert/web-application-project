// Knappene for overlevering (#188), slik de ser ut før noe er trykket: Bekreft overlevering er en sendeknapp med
// handlingen i skjemaet, Avbryt avtalen og Trekk tilbake åpner en bekreftelse og sender ikke noe. Selve åpningen (klikk)
// dekkes av nettlesertesten.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HandoverActions } from "./HandoverActions";

vi.mock("./actions", () => ({ updateRequest: vi.fn() }));

const render = (props: Partial<Parameters<typeof HandoverActions>[0]> = {}) =>
  renderToStaticMarkup(<HandoverActions requestId="r1" canConfirm canCancel canWithdraw={false} canReturn={false} {...props} />);

describe("HandoverActions", () => {
  it("Bekreft overlevering sender skjemaet med handlingen «confirm», og kommer før Avbryt avtalen", () => {
    const html = render();

    expect(html).toMatch(/<button type="submit"(?=[^>]*name="intent")(?=[^>]*value="confirm")[^>]*>Bekreft overlevering<\/button>/);
    expect(html.indexOf(">Bekreft overlevering<")).toBeLessThan(html.indexOf(">Avbryt avtalen<"));
  });

  it("Avbryt avtalen og Trekk tilbake er vanlige knapper som ikke sender skjemaet, og bekreftelsene er skjult til man trykker", () => {
    const html = render({ canWithdraw: true });

    expect(html).toMatch(/<button type="button"[^>]*>Avbryt avtalen<\/button>/);
    expect(html).toMatch(/<button type="button"[^>]*>Trekk tilbake<\/button>/);
    expect(html).not.toMatch(/Avbestille avtalen\?|Trekke tilbake forespørselen\?|Ja, /);
    expect(html).not.toMatch(/value="cancel"|value="withdraw"/);
  });

  // #253: destruktive handlinger har rød kant, som «Slett annonse». Godkjent av Max 02.11.
  it("Avbryt avtalen og Trekk tilbake har rød kant, og Bekreft overlevering har det ikke", () => {
    const html = render({ canWithdraw: true });
    const button = (label: string) => html.match(new RegExp(`<button[^>]*>${label}</button>`))?.[0] ?? "";

    expect(button("Avbryt avtalen")).toContain("border-danger");
    expect(button("Trekk tilbake")).toContain("border-danger");
    expect(button("Bekreft overlevering")).not.toContain("border-danger");
  });

  it("Bekreft retur er en vanlig knapp som ikke sender skjemaet, og bekreftelsen er skjult til man trykker (#214)", () => {
    const html = render({ canConfirm: false, canCancel: false, canReturn: true });

    expect(html).toMatch(/<button type="button"[^>]*>Bekreft retur<\/button>/);
    expect(html).not.toMatch(/Bekrefte at lånet er levert tilbake\?|Ja, bekreft retur|value="return"/);
  });

  it("viser bare knappene siden sier at du kan bruke", () => {
    expect(render()).not.toContain("Bekreft retur");
    expect(render({ canConfirm: false })).not.toContain("Bekreft overlevering");
    expect(render({ canCancel: false })).not.toContain("Avbryt avtalen");
    expect(render()).not.toContain("Trekk tilbake");
    expect(render({ canConfirm: false, canCancel: false })).not.toContain("<button");
  });

  it("sender forespørselen som skjult felt, og har ingen forklaringstekst", () => {
    const html = render({ canWithdraw: true });

    expect(html).toContain('<input type="hidden" name="requestId" value="r1"/>');
    expect(html.replace(/<script>[\s\S]*<\/script>/, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).toBe("Bekreft overlevering Avbryt avtalen Trekk tilbake");
  });
});
