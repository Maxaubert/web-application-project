// Lagring og servering av annonsebilder (#138), mot en bucket i minnet. Godkjent av Max 11.10.
import { describe, expect, it, vi } from "vitest";
import { createTestBucket, imageFile } from "@/test/test-bucket";
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
