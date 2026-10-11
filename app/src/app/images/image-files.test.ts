// Regler for annonsebilder (#138). Godkjent av Max 11.10.
import { describe, expect, it } from "vitest";
import { imageBytes, imageFile } from "@/test/test-bucket";
import { checkImages, MAX_IMAGE_BYTES, sniffImageType } from "./image-files";

describe("sniffImageType", () => {
  it("kjenner igjen JPEG, PNG og WebP fra innholdet", () => {
    expect(sniffImageType(new Uint8Array(imageBytes.jpg))).toBe("jpg");
    expect(sniffImageType(new Uint8Array(imageBytes.png))).toBe("png");
    expect(sniffImageType(new Uint8Array(imageBytes.webp))).toBe("webp");
  });

  it("avviser andre filer, også RIFF-filer som ikke er WebP", () => {
    expect(sniffImageType(new TextEncoder().encode("GIF89a......"))).toBeNull();
    expect(sniffImageType(new TextEncoder().encode("hei, ikke et bilde"))).toBeNull();
    expect(sniffImageType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x41, 0x56, 0x49, 0x20]))).toBeNull();
  });
});

describe("checkImages", () => {
  it("godtar opptil 10 bilder i samme rekkefølge, og hopper over tomme filfelt", async () => {
    const empty = new File([], "", { type: "application/octet-stream" });
    const result = await checkImages([imageFile("a.jpg"), empty, imageFile("b.png", "png"), "tekst"]);

    expect(result.images?.map((i) => [i.file.name, i.type])).toEqual([
      ["a.jpg", "jpg"],
      ["b.png", "png"],
    ]);
  });

  it("avviser 11 bilder, men godtar 10", async () => {
    const files = (n: number) => Array.from({ length: n }, (_, i) => imageFile(`${i}.jpg`));
    expect((await checkImages(files(11))).error).toBe("Høyst 10 bilder");
    expect((await checkImages(files(10))).images).toHaveLength(10);
  });

  it("avviser et bilde over 5 MB, men godtar akkurat 5 MB", async () => {
    const header = imageBytes.jpg.length;
    expect((await checkImages([imageFile("stor.jpg", "jpg", MAX_IMAGE_BYTES - header + 1)])).error).toBe("«stor.jpg» er større enn 5 MB");
    expect((await checkImages([imageFile("ok.jpg", "jpg", MAX_IMAGE_BYTES - header)])).images).toHaveLength(1);
  });

  it("avviser en fil som bare heter .jpg", async () => {
    const fake = new File([new TextEncoder().encode("MZ program")], "bilde.jpg", { type: "image/jpeg" });

    expect((await checkImages([fake])).error).toBe("«bilde.jpg» er ikke et bilde (JPEG, PNG eller WebP)");
  });
});
