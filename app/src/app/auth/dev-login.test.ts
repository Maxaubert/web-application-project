// Lås nr. 2 for den lokale innloggingssnarveien (#106): uten utviklingsserveren gir handleren 404
// uten å røre innloggingen. Godkjent av Max 10.10.
import type { RequestInfo } from "rwsdk/worker";
import { afterEach, describe, expect, it, vi } from "vitest";
import { devLogin } from "./dev-login";
import { getAuth } from "./instance";

vi.mock("./instance", () => ({ getAuth: vi.fn() }));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("devLogin", () => {
  it("gir 404 når appen ikke kjører under utviklingsserveren", async () => {
    vi.stubEnv("DEV", false);

    const response = await devLogin({ request: new Request("http://localhost/dev/login") } as RequestInfo);

    expect(response.status).toBe(404);
    expect(getAuth).not.toHaveBeenCalled();
  });
});
