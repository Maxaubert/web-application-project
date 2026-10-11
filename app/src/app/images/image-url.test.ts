// Adressene til annonsebildene og miniatyrene (#155). Godkjent av Max 11.10.
import { describe, expect, it } from "vitest";
import { imageUrl, thumbKey } from "./image-url";

describe("thumbKey", () => {
  it("legger miniatyren ved siden av originalen, alltid som JPEG, uansett originalens filtype", () => {
    expect(thumbKey("listings/a/b.jpg")).toBe("listings/a/b.thumb.jpg");
    expect(thumbKey("listings/a/b.png")).toBe("listings/a/b.thumb.jpg");
    expect(thumbKey("listings/a/b.webp")).toBe("listings/a/b.thumb.jpg");
  });

  it("bytter bare endelsen på slutten av nøkkelen", () => {
    expect(thumbKey("listings/jpg.png/b.png")).toBe("listings/jpg.png/b.thumb.jpg");
  });
});

describe("imageUrl", () => {
  it("gir adressen til originalen, eller til miniatyren", () => {
    expect(imageUrl("listings/a/b.png")).toBe("/images/listings/a/b.png");
    expect(imageUrl("listings/a/b.png", "thumb")).toBe("/images/listings/a/b.thumb.jpg");
  });
});
