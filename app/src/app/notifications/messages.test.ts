// Teksten i e-postvarslene (#232). Godkjent av Max 01.11.
import { describe, expect, it } from "vitest";
import { composeMessage, type NotifyEvent } from "./messages";

const base = { actorName: "Kari Hansen", title: "Kalkulator", link: "https://studentmarkedet.test/requests/r1" };

describe("composeMessage", () => {
  it("gir riktig emne for hver hendelse, og bud ved salg, forespørsel ved lån og gis bort", () => {
    const subjects: Record<NotifyEvent, string> = {
      new: "Nytt bud på «Kalkulator»",
      counter: "Motbud på «Kalkulator»",
      accepted: "Godtatt: «Kalkulator»",
      declined: "Avslått: «Kalkulator»",
      cancelled: "Avbestilt: «Kalkulator»",
    };
    for (const [event, subject] of Object.entries(subjects)) {
      expect(composeMessage({ ...base, event: event as NotifyEvent, type: "sale" }).subject).toBe(subject);
    }
    expect(composeMessage({ ...base, event: "new", type: "loan" }).subject).toBe("Ny forespørsel på «Kalkulator»");
    expect(composeMessage({ ...base, event: "new", type: "giveaway" }).text).toContain("Kari Hansen har sendt en forespørsel");
  });

  it("har navnet og lenken til forespørselen, men aldri telefon eller e-post", () => {
    for (const event of ["new", "counter", "accepted", "declined", "cancelled"] as const) {
      const { text } = composeMessage({ ...base, event, type: "sale" });
      expect(text).toContain("Kari Hansen");
      expect(text).toContain("https://studentmarkedet.test/requests/r1");
      expect(text).not.toMatch(/@|\+47|\d{8}/);
    }
  });
});
