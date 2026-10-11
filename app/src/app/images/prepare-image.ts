// Gjør et valgt bilde klart for opplasting i nettleseren (#141): HEIC fra iPhone gjøres om, bildet skaleres ned
// til høyst 2000 px og lagres som JPEG. Å tegne det på nytt fjerner også EXIF-data som GPS-posisjon, så
// annonsebildet ikke viser hvor det er tatt. heic-to er stort (3 MB) og lastes bare når det trengs.
import { fitWithin, isHeic } from "./pick-images";

async function decode(file: File): Promise<ImageBitmap> {
  if (isHeic(file)) {
    const { heicTo } = await import("heic-to");
    return heicTo({ blob: file, type: "bitmap" });
  }
  return createImageBitmap(file);
}

export async function prepareImage(file: File): Promise<File> {
  const bitmap = await decode(file);
  const { width, height } = fitWithin(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d")!;
  // Hvit bakgrunn, så gjennomsiktige PNG-er ikke blir svarte som JPEG.
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("Kunne ikke lage JPEG");
  return new File([blob], file.name.replace(/\.[^.]*$/, "") + ".jpg", { type: "image/jpeg" });
}
