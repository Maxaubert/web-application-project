// Lagring av annonsebilder i R2 (#61, #138). Tar bucketen som argument, så testene kan bruke en bucket i minnet,
// slik databasefunksjonene tar databasen som argument.
import { contentTypes, type CheckedImage } from "./image-files";
import { thumbKey } from "./image-url";

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

// Nøklene og miniatyrnøklene deres, til opprydding når lagringen av annonsen feiler (#155).
export const withThumbs = (keys: string[]) => keys.flatMap((key) => [key, thumbKey(key)]);

// Lagrer alle bildene og gir nøklene tilbake i samme rekkefølge. Miniatyr nummer i (#155) lagres ved siden av
// bilde nummer i, hvis den finnes. Feiler noe, slettes alt som allerede er lagret, også miniatyrene.
export async function storeImages(bucket: ImageBucket, listingId: string, images: CheckedImage[], thumbs: File[] = []): Promise<string[]> {
  const keys: string[] = [];
  const stored: string[] = [];
  try {
    for (const [index, image] of images.entries()) {
      const key = imageKey(listingId, image.type);
      await bucket.put(key, await image.file.arrayBuffer(), { httpMetadata: { contentType: contentTypes[image.type] } });
      stored.push(key);
      keys.push(key);
      const thumb = thumbs[index];
      if (thumb) {
        await bucket.put(thumbKey(key), await thumb.arrayBuffer(), { httpMetadata: { contentType: "image/jpeg" } });
        stored.push(thumbKey(key));
      }
    }
    return keys;
  } catch (error) {
    if (stored.length > 0) await bucket.delete(stored);
    throw error;
  }
}
