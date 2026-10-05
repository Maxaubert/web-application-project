// Domenesjekken for HiØ-e-post (FK-01, AK-30). Godkjent av Max 05.10.
import { describe, expect, it } from "vitest";
import { isHiofEmail } from "./hiof-email";

describe("isHiofEmail", () => {
  it.each(["ola@hiof.no", "  OLA.Nordmann@HIOF.NO  "])("godtar %j", (email) => {
    expect(isHiofEmail(email)).toBe(true);
  });

  it.each(["ola@gmail.com", "ola@hiof.no.evil.com", "@hiof.no", "ola nordmann@hiof.no", "", 42])(
    "avviser %j",
    (email) => {
      expect(isHiofEmail(email)).toBe(false);
    },
  );
});
