// Sidevakter (AK-02). Godkjent av Max 05.10.
import { describe, expect, it } from "vitest";
import { anonymousSession, requireUser, type AppSession } from "./guards";

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
