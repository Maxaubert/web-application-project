"use client";
// Bildene i «Legg ut annonse» (#141). Hvert bilde vises med en gang det er valgt, og gjøres klart (HEIC, nedskalering)
// i bakgrunnen. Det første i listen er forsidebildet. Filene sendes med skjemaet i denne rekkefølgen.
import { useEffect, useRef, useState } from "react";
import { moveToFront, pickImages, type Rejected } from "@/app/images/pick-images";
import { prepareImage } from "@/app/images/prepare-image";

// file og thumb er ferdig behandlet; url og thumbUrl viser dem. Før det vises bare originalen. stored: bildet ligger
// allerede i R2 (Administrer, #229) og har ingen fil å gjøre klar.
export type PickedImage = { id: string; url: string; thumbUrl?: string; file?: File; thumb?: File; stored?: true };

export function useListingImages(initial: PickedImage[] = []) {
  const [images, setImages] = useState<PickedImage[]>(initial);
  const [rejected, setRejected] = useState<Rejected[]>([]);
  // Alle forhåndsvisningsadresser som er laget, så de kan frigjøres når siden forlates.
  const urls = useRef(new Set<string>());
  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const objectUrl = (file: File) => {
    const url = URL.createObjectURL(file);
    urls.current.add(url);
    return url;
  };

  function add(files: File[]) {
    const { accepted, rejected } = pickImages(images.length, files);
    setRejected(rejected);
    const added = accepted.map((file) => ({ id: crypto.randomUUID(), url: objectUrl(file), source: file }));
    setImages((current) => [...current, ...added.map(({ id, url }) => ({ id, url }))]);
    for (const { id, source } of added) {
      prepareImage(source).then(
        ({ file, thumb }) =>
          setImages((current) =>
            current.map((image) => (image.id === id ? { id, url: objectUrl(file), thumbUrl: objectUrl(thumb), file, thumb } : image)),
          ),
        () => {
          setImages((current) => current.filter((image) => image.id !== id));
          setRejected((current) => [...current, { name: source.name, reason: "kunne ikke leses som bilde" }]);
        },
      );
    }
  }

  const remove = (id: string) => setImages((current) => current.filter((image) => image.id !== id));
  const makeCover = (id: string) => setImages((current) => moveToFront(current, current.findIndex((image) => image.id === id)));

  return { images, rejected, busy: images.some((image) => !image.file && !image.stored), add, remove, makeCover };
}
