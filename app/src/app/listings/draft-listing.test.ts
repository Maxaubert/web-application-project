// Skjemaets verdier som annonse, til forhåndsvisningen (#171).
import { describe, expect, it } from "vitest";
import { draftListing } from "./draft-listing";
import type { ListingFormValues } from "./listing-schema";

const EMPTY: ListingFormValues = { title: "", description: "", category: "", type: "sale", condition: "", price: "" };
const draft = (values: Partial<ListingFormValues>) => draftListing({ ...EMPTY, ...values });

describe("draftListing", () => {
  it("tar med det som er skrevet, uten mellomrom i ytterkantene", () => {
    const listing = draft({ title: "  Lampe ", description: " Lite brukt. ", category: "furniture", condition: "used", type: "loan", price: " 40 " });

    expect(listing).toMatchObject({ type: "loan", title: "Lampe", description: "Lite brukt.", category: "furniture", condition: "used", price: 40 });
  });

  it("tom tittel blir plassholderen «Tittel», og ukjent handelstype blir salg", () => {
    expect(draft({}).title).toBe("Tittel");
    expect(draft({ type: "bytte" }).type).toBe("sale");
  });

  it("ugyldig eller manglende pris er ingen pris, og gis bort har aldri pris", () => {
    expect(draft({ price: "" }).price).toBeNull();
    expect(draft({ price: "100,-" }).price).toBeNull();
    expect(draft({ type: "giveaway", price: "500" }).price).toBeNull();
    expect(draft({ price: "250" }).price).toBe(250);
  });
});
