// GET /images/listings/:listingId/:file (#138): sender et annonsebilde fra R2. Vakten requireApiUser står foran
// i worker.tsx, så bare innloggede får bildene, som resten av appen. Nøkkelen bygges bare av deler som matcher
// formatet vi selv lager, så adressen kan ikke brukes til å lese andre filer i bucketen.
import type { RequestInfo } from "rwsdk/worker";
import { imageBucket } from "./bucket";
import type { ImageBucket } from "./storage";

const LISTING_ID = /^[0-9a-f-]{36}$/;
const FILE = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

export async function readImage(bucket: ImageBucket, listingId: string, file: string): Promise<Response> {
  if (!LISTING_ID.test(listingId) || !FILE.test(file)) return new Response("Not Found", { status: 404 });
  const object = await bucket.get(`listings/${listingId}/${file}`);
  if (!object) return new Response("Not Found", { status: 404 });
  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      // Nøkkelen er unik og endres aldri, så nettleseren kan beholde bildet. «private»: bare for denne brukeren.
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}

export function serveImage({ params }: RequestInfo<{ listingId: string; file: string }>) {
  return readImage(imageBucket, params.listingId, params.file);
}
