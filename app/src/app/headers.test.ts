import { afterEach, describe, expect, it, vi } from "vitest";
import { setCommonHeaders } from "./headers";

function headersFor(development: boolean) {
  vi.stubEnv("VITE_IS_DEV_SERVER", development ? "true" : undefined);
  const response = { headers: new Headers() };
  const middleware = setCommonHeaders();
  middleware({ response, rw: { nonce: "test-nonce" } } as Parameters<typeof middleware>[0]);
  return response.headers;
}

afterEach(() => vi.unstubAllEnvs());

describe("starter response headers", () => {
  it("limits browser capabilities and binds scripts to the request nonce", () => {
    const headers = headersFor(true);
    expect(headers.get("Content-Security-Policy")).toContain("'nonce-test-nonce'");
    expect(headers.get("Content-Security-Policy")).toContain("object-src 'none'");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(headers.get("Permissions-Policy")).toBe("geolocation=(), microphone=(), camera=()");
  });

  // Bildefeltet (#141). Godkjent av Max 11.10.
  it("allows blob: only for images, workers and their loading, so image previews and HEIC conversion work", () => {
    const csp = headersFor(false).get("Content-Security-Policy")!;
    expect(csp).toContain("img-src 'self' blob:;");
    expect(csp).toContain("worker-src 'self' blob:;");
    expect(csp).toContain("connect-src 'self' blob:;");
    expect(csp).toMatch(/^default-src 'self';/);
  });

  // Rydd CSP (#275). Godkjent av Max 04.11.
  it("allows no eval and no Turnstile in production, and eval only on the dev server", () => {
    const production = headersFor(false).get("Content-Security-Policy")!;
    expect(production).not.toContain("'unsafe-eval'");
    expect(production).not.toContain("challenges.cloudflare.com");
    expect(headersFor(true).get("Content-Security-Policy")).toContain("'unsafe-eval'");
  });

  it("does not force HTTPS on the local development server", () => {
    expect(headersFor(true).has("Strict-Transport-Security")).toBe(false);
  });

  it("sets HSTS for production responses", () => {
    expect(headersFor(false).get("Strict-Transport-Security"))
      .toBe("max-age=63072000; includeSubDomains; preload");
  });
});
