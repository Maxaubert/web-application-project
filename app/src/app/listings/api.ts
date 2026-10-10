// REST-endepunktet GET /api/listings?q=&limit= (T03, #98). Samme søk som forsiden, men svarer med
// JSON, så nettleseren kan hente treff uten å laste siden på nytt (live søkeforslag, #104).
// Kontrakten står i wireframe-README. Vakten requireApiUser står foran i worker.tsx.
import type { RequestInfo } from "rwsdk/worker";
import { z } from "zod";
import { db } from "@/db";
import { getActiveListings, type ListingWithOwner } from "./queries";
import { searchSchema } from "./search-params";
import { searchListings } from "./search-listings";

const apiSchema = searchSchema.extend({
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

// Bare disse feltene sendes; nye kolonner må legges til her med vilje.
function toJson({ listing }: ListingWithOwner) {
  const { id, title, type, price, status } = listing;
  return { id, title, type, price, status };
}

export async function getListings({ request }: RequestInfo) {
  const parsed = apiSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return Response.json({ error: "Ugyldig søk." }, { status: 400 });
  const { q, limit } = parsed.data;
  const hits = searchListings(await getActiveListings(db), q).slice(0, limit);
  return Response.json({ listings: hits.map(toJson) });
}
