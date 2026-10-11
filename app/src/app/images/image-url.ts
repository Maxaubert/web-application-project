// Adressen et annonsebilde serveres fra (serve-image.ts), laget av nøkkelen i R2 (#150).
// Nøkkelen er «listings/<annonse>/<fil>», så adressen blir «/images/listings/<annonse>/<fil>».
export function imageUrl(key: string) {
  return `/images/${key}`;
}
