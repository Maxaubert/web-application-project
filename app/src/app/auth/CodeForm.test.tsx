// Kodefeltet (#284). Godkjent av Max 04.11.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CodeForm } from "./CodeForm";

vi.mock("./actions", () => ({ resendCode: vi.fn(), verifyCode: vi.fn() }));

describe("CodeForm", () => {
  it("kodefeltet tar bare seks tegn, som koden har", () => {
    const html = renderToStaticMarkup(<CodeForm />);

    expect(html).toMatch(/<input[^>]*id="code"[^>]*maxLength="6"/);
  });
});
