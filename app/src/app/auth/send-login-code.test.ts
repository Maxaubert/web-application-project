// Koden kan bare nå nettleseren via den lokale utskriften. Godkjent av Max 05.10.
import { describe, expect, it } from "vitest";
import { emailNotConfigured, getDevCode, printLoginCode } from "./send-login-code";

describe("getDevCode", () => {
  it("gir ingen kode når e-postversjonen brukes", async () => {
    await expect(emailNotConfigured("prod@hiof.no", "123456")).rejects.toThrow();
    expect(getDevCode("prod@hiof.no")).toBeUndefined();
  });

  it("gir nøyaktig koden som ble skrevet ut lokalt", async () => {
    await printLoginCode("Lokal@hiof.no", "654321");
    expect(getDevCode("lokal@hiof.no")).toBe("654321");
  });
});
