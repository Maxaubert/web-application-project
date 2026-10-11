// Lagring av annonsebilder i R2 (#61, #138). Tar bucketen som argument, så testene kan bruke en bucket i minnet,
// slik databasefunksjonene tar databasen som argument.
import { contentTypes, type CheckedImage } from "./image-files";

// Den delen av R2Bucket vi bruker. Den ekte bindingen (env.IMAGES) oppfyller den.
export type ImageBucket = {
  put(key: string, value: ArrayBuffer, options: { httpMetadata: { contentType: string } }): Promise<unknown>;
  get(key: string): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string } } | null>;
  delete(keys: string | string[]): Promise<void>;
};

// Nøkkelen bestemmer også adressen bildet serveres fra: /images/listings/<annonse>/<fil>.
export function imageKey(listingId: string, type: CheckedImage["type"]) {
  return `listings/${listingId}/${crypto.randomUUID()}.${type}`;
}

// Lagrer alle bildene og gir nøklene tilbake i samme rekkefølge. Feiler ett, slettes de som allerede er lagret.
export async function storeImages(bucket: ImageBucket, listingId: string, images: CheckedImage[]): Promise<string[]> {
  const keys: string[] = [];
  try {
    for (const image of images) {
      const key = imageKey(listingId, image.type);
      await bucket.put(key, await image.file.arrayBuffer(), { httpMetadata: { contentType: contentTypes[image.type] } });
      keys.push(key);
    }
    return keys;
  } catch (error) {
    if (keys.length > 0) await bucket.delete(keys);
    throw error;
  }
}
