// Gjør et valgt bilde klart for opplasting i nettleseren (#141): HEIC fra iPhone gjøres om, bildet skaleres ned
// til høyst 2000 px og lagres som JPEG, og det lages en miniatyr på 640 px til kort og søkeforslag (#155). Å tegne
// bildet på nytt fjerner også EXIF-data som GPS-posisjon, så annonsebildet ikke viser hvor det er tatt.
// heic-to er stort (3 MB) og lastes bare når det trengs.
import { fitWithin, isHeic, MAX_SIDE, THUMB_SIDE } from "./pick-images";

async function decode(file: File): Promise<ImageBitmap> {
  if (isHeic(file)) {
    const { heicTo } = await import("heic-to");
    return heicTo({ blob: file, type: "bitmap" });
  }
  return createImageBitmap(file);
}

async function toJpeg(bitmap: ImageBitmap, maxSide: number, quality: number, name: string): Promise<File> {
  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxSide);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d")!;
  // Hvit bakgrunn, så gjennomsiktige PNG-er ikke blir svarte som JPEG.
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("Kunne ikke lage JPEG");
  return new File([blob], name, { type: "image/jpeg" });
}

export async function prepareImage(file: File): Promise<{ file: File; thumb: File }> {
  const bitmap = await decode(file);
  try {
    const name = file.name.replace(/\.[^.]*$/, "");
    return {
      file: await toJpeg(bitmap, MAX_SIDE, 0.85, `${name}.jpg`),
      thumb: await toJpeg(bitmap, THUMB_SIDE, 0.8, `${name}.thumb.jpg`),
    };
  } finally {
    bitmap.close();
  }
}
