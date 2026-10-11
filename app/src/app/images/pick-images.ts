// Hvilke valgte filer som kan legges til i «Legg ut annonse» (#141). Kjøres i nettleseren før bildene gjøres
// klare; serveren sjekker alt på nytt (image-files.ts). Grensen på 25 MB gjelder originalen fra mobilen eller
// kameraet. Det som lastes opp, er skalert ned til høyst 2000 px og godt under serverens 5 MB.
import { MAX_IMAGES } from "@/db/schema";

export const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
export const MAX_SIDE = 2000;
// Miniatyrene til kort og søkeforslag (#155): 640 px er skarpt også på skjermer med høy oppløsning.
export const THUMB_SIDE = 640;

export type Rejected = { name: string; reason: string };

// iPhone-bilder fra en datamaskin har ofte tom type, så HEIC kjennes også igjen på filendelsen.
export function isHeic(file: { name: string; type: string }) {
  return /^image\/hei[cf]/.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

export function pickImages(alreadyAdded: number, files: File[]): { accepted: File[]; rejected: Rejected[] } {
  const accepted: File[] = [];
  const rejected: Rejected[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/") && !isHeic(file)) rejected.push({ name: file.name, reason: "bare bilder (JPEG, PNG, WebP eller HEIC)" });
    else if (file.size > MAX_SOURCE_BYTES) rejected.push({ name: file.name, reason: "større enn 25 MB" });
    else if (alreadyAdded + accepted.length >= MAX_IMAGES) rejected.push({ name: file.name, reason: `høyst ${MAX_IMAGES} bilder` });
    else accepted.push(file);
  }
  return { accepted, rejected };
}

// Største størrelse innenfor max × max med samme sideforhold. Små bilder forstørres ikke.
export function fitWithin(width: number, height: number, max = MAX_SIDE) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

// Gjør bilde nummer `index` til forsidebilde ved å flytte det først. Resten beholder rekkefølgen.
export function moveToFront<T>(items: T[], index: number): T[] {
  if (index <= 0 || index >= items.length) return items;
  return [items[index], ...items.slice(0, index), ...items.slice(index + 1)];
}
