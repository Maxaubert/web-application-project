// Sidevakter (AK-02). Godkjent av Max 05.10.
import { describe, expect, it } from "vitest";
import { anonymousSession, requireApiUser, requireUser, type AppSession } from "./guards";

const loggedIn: AppSession = { userId: "u1", email: "ola@hiof.no", name: "Ola", needsSetup: false, isAuthenticated: true };
const call = (session: AppSession) => requireUser({ ctx: { session } } as Parameters<typeof requireUser>[0]);

describe("requireUser", () => {
  it("sender bruker uten økt til innlogging", () => {
    const response = call(anonymousSession);
    expect(response?.status).toBe(302);
    expect(response?.headers.get("Location")).toBe("/login");
  });

  it("sender innlogget bruker uten kontooppsett til oppsettet", () => {
    const response = call({ ...loggedIn, needsSetup: true });
    expect(response?.headers.get("Location")).toBe("/account-setup");
  });

  it("slipper gjennom innlogget bruker med fullført konto", () => {
    expect(call(loggedIn)).toBeUndefined();
  });
});

// API-vakten (#98). Godkjent av Max 10.10.
const callApi = (session: AppSession) => requireApiUser({ ctx: { session } } as Parameters<typeof requireApiUser>[0]);

describe("requireApiUser", () => {
  it("API: gir 401 med feilmelding uten økt", async () => {
    const response = callApi(anonymousSession);
    expect(response?.status).toBe(401);
    expect(await response?.json()).toHaveProperty("error");
  });

  it("API: gir 403 til innlogget bruker uten kontooppsett", () => {
    expect(callApi({ ...loggedIn, needsSetup: true })?.status).toBe(403);
  });

  it("API: slipper gjennom innlogget bruker med fullført konto", () => {
    expect(callApi(loggedIn)).toBeUndefined();
  });
});
