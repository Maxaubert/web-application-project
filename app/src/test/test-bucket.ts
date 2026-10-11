// R2-bucket i minnet for testene (#138): lagrer, henter og sletter faktisk, så testene kan sjekke hva som
// ligger igjen. failOnPut lar en test simulere at R2 feiler på et bestemt bilde.
import type { ImageBucket } from "@/app/images/storage";

export type TestBucket = ImageBucket & { objects: Map<string, { bytes: Uint8Array; contentType: string }>; failOnPut?: number };

export function createTestBucket(): TestBucket {
  const objects = new Map<string, { bytes: Uint8Array; contentType: string }>();
  let puts = 0;
  const bucket: TestBucket = {
    objects,
    async put(key, value, options) {
      puts += 1;
      if (bucket.failOnPut === puts) throw new Error("R2 feilet");
      objects.set(key, { bytes: new Uint8Array(value), contentType: options.httpMetadata.contentType });
    },
    async get(key) {
      const object = objects.get(key);
      if (!object) return null;
      return { body: new Blob([object.bytes.slice()]).stream(), httpMetadata: { contentType: object.contentType } };
    },
    async delete(keys) {
      for (const key of Array.isArray(keys) ? keys : [keys]) objects.delete(key);
    },
  };
  return bucket;
}

// Små filer med riktige «magiske tall» i starten, nok til at filtypen kjennes igjen.
export const imageBytes = {
  jpg: [0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d],
  webp: [0x52, 0x49, 0x46, 0x46, 0x24, 0, 0, 0, 0x57, 0x45, 0x42, 0x50],
};

export function imageFile(name: string, kind: keyof typeof imageBytes = "jpg", extraBytes = 0) {
  return new File([new Uint8Array([...imageBytes[kind], ...new Array(extraBytes).fill(0)])], name, { type: "image/jpeg" });
}
