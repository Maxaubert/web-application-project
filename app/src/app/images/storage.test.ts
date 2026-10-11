// Lagring og servering av annonsebilder (#138), mot en bucket i minnet. Godkjent av Max 11.10.
import { describe, expect, it, vi } from "vitest";
import { createTestBucket, imageFile } from "@/test/test-bucket";
import { thumbKey } from "./image-url";
import { readImage } from "./serve-image";
import { storeImages } from "./storage";

// Den ekte bindingen finnes bare i Cloudflare; readImage får bucketen som argument.
vi.mock("./bucket", () => ({ imageBucket: {} }));

const LISTING = "11111111-2222-3333-4444-555555555555";

describe("storeImages", () => {
  it("lagrer hvert bilde under annonsen med riktig innholdstype og gir nøklene i rekkefølge", async () => {
    const bucket = createTestBucket();

    const keys = await storeImages(bucket, LISTING, [
      { file: imageFile("a.jpg"), type: "jpg" },
      { file: imageFile("b.png", "png"), type: "png" },
    ]);

    expect(keys).toHaveLength(2);
    expect(keys[0]).toMatch(new RegExp(`^listings/${LISTING}/[0-9a-f-]{36}\\.jpg$`));
    expect(bucket.objects.get(keys[0])?.contentType).toBe("image/jpeg");
    expect(bucket.objects.get(keys[1])?.contentType).toBe("image/png");
  });

  it("feiler ett bilde, slettes de som alt er lagret, og feilen sendes videre", async () => {
    const bucket = createTestBucket();
    bucket.failOnPut = 2;

    await expect(
      storeImages(bucket, LISTING, [
        { file: imageFile("a.jpg"), type: "jpg" },
        { file: imageFile("b.jpg"), type: "jpg" },
      ]),
    ).rejects.toThrow("R2 feilet");
    expect(bucket.objects.size).toBe(0);
  });
});

// Miniatyrer (#155). Godkjent av Max 11.10.
describe("storeImages med miniatyrer", () => {
  const originals = [
    { file: imageFile("a.jpg"), type: "jpg" as const },
    { file: imageFile("b.png", "png"), type: "png" as const },
  ];

  it("lagrer miniatyr nummer i ved siden av bilde nummer i, som JPEG, og gir bare originalnøklene tilbake", async () => {
    const bucket = createTestBucket();

    const keys = await storeImages(bucket, LISTING, originals, [imageFile("a.thumb.jpg", "jpg", 1), imageFile("b.thumb.jpg", "jpg", 2)]);

    expect(keys).toHaveLength(2);
    expect(keys[1]).toMatch(/\.png$/);
    expect(thumbKey(keys[1])).toMatch(/\.thumb\.jpg$/);
    expect(bucket.objects.size).toBe(4);
    expect(bucket.objects.get(thumbKey(keys[0]))).toMatchObject({ contentType: "image/jpeg" });
    expect(bucket.objects.get(thumbKey(keys[0]))?.bytes).toHaveLength(13);
    expect(bucket.objects.get(thumbKey(keys[1]))?.bytes).toHaveLength(14);
  });

  it("uten miniatyrer lagres bare originalene", async () => {
    const bucket = createTestBucket();
    await storeImages(bucket, LISTING, originals);
    expect(bucket.objects.size).toBe(2);
  });

  it("feiler en miniatyr, slettes alt som er lagret, også originalen og de tidligere miniatyrene", async () => {
    const bucket = createTestBucket();
    bucket.failOnPut = 4;

    await expect(storeImages(bucket, LISTING, originals, [imageFile("a.thumb.jpg"), imageFile("b.thumb.jpg")])).rejects.toThrow("R2 feilet");

    expect(bucket.objects.size).toBe(0);
  });
});

describe("readImage", () => {
  it("sender bildet med innholdstype og lang hurtiglagring", async () => {
    const bucket = createTestBucket();
    const [key] = await storeImages(bucket, LISTING, [{ file: imageFile("a.jpg"), type: "jpg" }]);

    const response = await readImage(bucket, LISTING, key.split("/")[2]);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/jpeg");
    expect(response.headers.get("Cache-Control")).toBe("private, max-age=31536000, immutable");
    expect(new Uint8Array(await response.arrayBuffer())[0]).toBe(0xff);
  });

  it("sender miniatyren når den finnes, og originalen når miniatyren mangler", async () => {
    const bucket = createTestBucket();
    const [withThumb, without] = await storeImages(
      bucket,
      LISTING,
      [
        { file: imageFile("a.jpg"), type: "jpg" },
        { file: imageFile("b.png", "png"), type: "png" },
      ],
      [],
    );
    bucket.objects.set(thumbKey(withThumb), { bytes: new Uint8Array([0xff, 0xd8, 0xff]), contentType: "image/jpeg" });
    const file = (key: string) => thumbKey(key).split("/")[2];

    const thumb = await readImage(bucket, LISTING, file(withThumb));
    expect((await thumb.arrayBuffer()).byteLength).toBe(3);

    const fallback = await readImage(bucket, LISTING, file(without));
    expect(fallback.status).toBe(200);
    expect(fallback.headers.get("Content-Type")).toBe("image/png");
    expect((await fallback.arrayBuffer()).byteLength).toBe(12);
  });

  it("gir 404 når verken miniatyren eller originalen finnes, og for miniatyradresser i feil format", async () => {
    const bucket = createTestBucket();
    const id = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
    bucket.objects.set(`listings/${LISTING}/${id}.thumb.png`, { bytes: new Uint8Array([1]), contentType: "image/png" });

    expect((await readImage(bucket, LISTING, `${id}.thumb.jpg`)).status).toBe(404);
    expect((await readImage(bucket, LISTING, `${id}.thumb.png`)).status).toBe(404);
    expect((await readImage(bucket, LISTING, `${id}.thumb.thumb.jpg`)).status).toBe(404);
  });

  it("gir 404 for ukjent bilde og for adresser som ikke har vårt format", async () => {
    const bucket = createTestBucket();
    // En fil som finnes i bucketen, men ikke har formatet vi lager, skal ikke kunne hentes gjennom adressen.
    bucket.objects.set(`listings/${LISTING}/hemmelig.txt`, { bytes: new Uint8Array([1]), contentType: "text/plain" });
    bucket.objects.set("listings/annet/bilde.jpg", { bytes: new Uint8Array([1]), contentType: "image/jpeg" });

    expect((await readImage(bucket, LISTING, "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.jpg")).status).toBe(404);
    expect((await readImage(bucket, LISTING, "hemmelig.txt")).status).toBe(404);
    expect((await readImage(bucket, "annet", "bilde.jpg")).status).toBe(404);
  });
});
