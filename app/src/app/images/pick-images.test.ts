// Valg av bilder i nettleseren (#141). Godkjent av Max 11.10.
import { describe, expect, it } from "vitest";
import { fitWithin, isHeic, MAX_SOURCE_BYTES, moveToFront, pickImages } from "./pick-images";

const file = (name: string, type: string, size = 10) => new File([new Uint8Array(size)], name, { type });

describe("pickImages", () => {
  it("tar bilder og HEIC uten type, og avviser andre filer med grunn", () => {
    const { accepted, rejected } = pickImages(0, [file("a.jpg", "image/jpeg"), file("IMG_1.HEIC", ""), file("ferie.mov", "video/quicktime")]);

    expect(accepted.map((f) => f.name)).toEqual(["a.jpg", "IMG_1.HEIC"]);
    expect(rejected).toEqual([{ name: "ferie.mov", reason: "bare bilder (JPEG, PNG, WebP eller HEIC)" }]);
  });

  it("avviser originaler over 25 MB, men tar en på grensen", () => {
    const { accepted, rejected } = pickImages(0, [file("ok.jpg", "image/jpeg", MAX_SOURCE_BYTES), file("stor.jpg", "image/jpeg", MAX_SOURCE_BYTES + 1)]);

    expect(accepted.map((f) => f.name)).toEqual(["ok.jpg"]);
    expect(rejected).toEqual([{ name: "stor.jpg", reason: "større enn 25 MB" }]);
  });

  it("tar bare så mange som får plass opp til 10, medregnet de som alt er lagt til", () => {
    const three = ["a", "b", "c"].map((n) => file(`${n}.jpg`, "image/jpeg"));
    const { accepted, rejected } = pickImages(8, three);

    expect(accepted.map((f) => f.name)).toEqual(["a.jpg", "b.jpg"]);
    expect(rejected).toEqual([{ name: "c.jpg", reason: "høyst 10 bilder" }]);
  });
});

describe("isHeic", () => {
  it("kjenner igjen HEIC og HEIF på type eller endelse", () => {
    expect(isHeic({ name: "x", type: "image/heic" })).toBe(true);
    expect(isHeic({ name: "x.heif", type: "" })).toBe(true);
    expect(isHeic({ name: "heic.jpg", type: "image/jpeg" })).toBe(false);
  });
});

describe("fitWithin", () => {
  it("skalerer den lengste siden ned til 2000 px og beholder sideforholdet, men forstørrer ikke", () => {
    expect(fitWithin(4032, 3024)).toEqual({ width: 2000, height: 1500 });
    expect(fitWithin(3000, 6000)).toEqual({ width: 1000, height: 2000 });
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });
});

describe("moveToFront", () => {
  it("flytter det valgte bildet først og beholder rekkefølgen på resten", () => {
    expect(moveToFront(["a", "b", "c", "d"], 2)).toEqual(["c", "a", "b", "d"]);
    expect(moveToFront(["a", "b"], 0)).toEqual(["a", "b"]);
    expect(moveToFront(["a", "b"], -1)).toEqual(["a", "b"]);
  });
});
