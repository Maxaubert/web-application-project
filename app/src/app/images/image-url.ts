// Adressen et annonsebilde serveres fra (serve-image.ts), laget av nøkkelen i R2 (#150).
// Nøkkelen er «listings/<annonse>/<fil>», så adressen blir «/images/listings/<annonse>/<fil>».
// Miniatyren (#155) ligger ved siden av originalen, med «.thumb.jpg» i stedet for endelsen. Kort og søkeforslag
// bruker den, så nettleseren slipper å laste og dekode et stort bilde for å vise et lite.
export function thumbKey(key: string) {
  return key.replace(/\.(jpg|png|webp)$/, ".thumb.jpg");
}

export function imageUrl(key: string, size: "full" | "thumb" = "full") {
  return `/images/${size === "thumb" ? thumbKey(key) : key}`;
}
