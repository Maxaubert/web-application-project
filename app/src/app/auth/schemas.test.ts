// Kontooppsettet: navn og telefon for valgt land (Max 05.10). Godkjent av Max 05.10.
import { describe, expect, it } from "vitest";
import { accountSchema } from "./schemas";

const parse = (name: string, country: string, phone: string) => accountSchema.safeParse({ name, country, phone });

describe("accountSchema", () => {
  it("godtar et norsk mobilnummer og lagrer det i standardform", () => {
    const result = parse("Ola Nordmann", "NO", "912 34 567");
    expect(result.success && result.data).toEqual({ name: "Ola Nordmann", phone: "+4791234567" });
  });

  it("godtar et svensk nummer når Sverige er valgt", () => {
    const result = parse("Anna Svensson", "SE", "070 123 45 67");
    expect(result.success && result.data.phone).toBe("+46701234567");
  });

  it("avviser et svensk nummer når Norge er valgt", () => {
    expect(parse("Anna Svensson", "NO", "+46 70 123 45 67").success).toBe(false);
  });

  it("avviser et nummer som er for kort", () => {
    expect(parse("Ola Nordmann", "NO", "123").success).toBe(false);
  });

  it("avviser et navn på ett tegn", () => {
    expect(parse("O", "NO", "912 34 567").success).toBe(false);
  });
});
