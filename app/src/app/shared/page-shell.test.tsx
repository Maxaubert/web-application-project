// Rammen rundt alle sider (#113). Godkjent av Max 10.10.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PageShell } from "./page-shell";

describe("PageShell", () => {
  it("logoen og navnet lenker til forsiden, og siden får egen fanetittel", () => {
    const html = renderToStaticMarkup(<PageShell title="Logg inn">innhold</PageShell>);

    expect(html).toMatch(/<a href="\/"[^>]*>[\s\S]*Studentmarkedet[\s\S]*<\/a>/);
    expect(html).toContain("<title>Logg inn – Studentmarkedet</title>");
  });
});
