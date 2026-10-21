// Knappene for overlevering (#188), slik de ser ut før noe er trykket: Bekreft overlevering er en sendeknapp med
// handlingen i skjemaet, Avbestill og Trekk tilbake åpner en bekreftelse og sender ikke noe. Selve åpningen (klikk)
// dekkes av nettlesertesten.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HandoverActions } from "./HandoverActions";

vi.mock("./actions", () => ({ updateRequest: vi.fn() }));

const render = (props: Partial<Parameters<typeof HandoverActions>[0]> = {}) =>
  renderToStaticMarkup(<HandoverActions requestId="r1" canConfirm canCancel canWithdraw={false} {...props} />);

describe("HandoverActions", () => {
  it("Bekreft overlevering sender skjemaet med handlingen «confirm», og kommer før Avbestill", () => {
    const html = render();

    expect(html).toMatch(/<button type="submit"(?=[^>]*name="intent")(?=[^>]*value="confirm")[^>]*>Bekreft overlevering<\/button>/);
    expect(html.indexOf(">Bekreft overlevering<")).toBeLessThan(html.indexOf(">Avbestill<"));
  });

  it("Avbestill og Trekk tilbake er vanlige knapper som ikke sender skjemaet, og bekreftelsene er skjult til man trykker", () => {
    const html = render({ canWithdraw: true });

    expect(html).toMatch(/<button type="button"[^>]*>Avbestill<\/button>/);
    expect(html).toMatch(/<button type="button"[^>]*>Trekk tilbake<\/button>/);
    expect(html).not.toMatch(/Avbestille avtalen\?|Trekke tilbake forespørselen\?|Ja, /);
    expect(html).not.toMatch(/value="cancel"|value="withdraw"/);
  });

  it("viser bare knappene siden sier at du kan bruke", () => {
    expect(render({ canConfirm: false })).not.toContain("Bekreft overlevering");
    expect(render({ canCancel: false })).not.toContain("Avbestill");
    expect(render()).not.toContain("Trekk tilbake");
    expect(render({ canConfirm: false, canCancel: false })).not.toContain("<button");
  });

  it("sender forespørselen som skjult felt, og har ingen forklaringstekst", () => {
    const html = render({ canWithdraw: true });

    expect(html).toContain('<input type="hidden" name="requestId" value="r1"/>');
    expect(html.replace(/<script>[\s\S]*<\/script>/, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).toBe("Bekreft overlevering Avbestill Trekk tilbake");
  });
});
