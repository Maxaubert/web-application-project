// Regler for annonsebilder (#61, Max 11.10): høyst 10 bilder, høyst 5 MB per bilde, bare JPEG, PNG og WebP.
// Filtypen leses fra de første bytene i filen, ikke fra navnet eller nettleserens oppgitte type, så en
// fil som bare heter «bilde.jpg» avvises. HEIC fra iPhone gjøres om til JPEG i nettleseren før opplasting.
import { MAX_IMAGES } from "@/db/schema";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type ImageType = "jpg" | "png" | "webp";

export const contentTypes: Record<ImageType, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) => signature.every((b, i) => bytes[offset + i] === b);

// «Magiske tall» i starten av filen. WebP er en RIFF-fil med «WEBP» fra byte 8.
export function sniffImageType(bytes: Uint8Array): ImageType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "jpg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return "webp";
  return null;
}

export type CheckedImage = { file: File; type: ImageType };
type ImageCheck = { images: CheckedImage[]; error?: undefined } | { images?: undefined; error: string };

// Tomme filfelt (ingen fil valgt) telles ikke. Første feil vinner, så meldingen blir kort.
export async function checkImages(entries: FormDataEntryValue[]): Promise<ImageCheck> {
  const files = entries.filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length > MAX_IMAGES) return { error: `Høyst ${MAX_IMAGES} bilder` };
  const images: CheckedImage[] = [];
  for (const file of files) {
    if (file.size > MAX_IMAGE_BYTES) return { error: `«${file.name}» er større enn 5 MB` };
    const type = sniffImageType(new Uint8Array(await file.slice(0, 12).arrayBuffer()));
    if (!type) return { error: `«${file.name}» er ikke et bilde (JPEG, PNG eller WebP)` };
    images.push({ file, type });
  }
  return { images };
}
