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

  it("does not force HTTPS on the local development server", () => {
    expect(headersFor(true).has("Strict-Transport-Security")).toBe(false);
  });

  it("sets HSTS for production responses", () => {
    expect(headersFor(false).get("Strict-Transport-Security"))
      .toBe("max-age=63072000; includeSubDomains; preload");
  });
});
