// REST-endepunktet GET /api/listings?q=&limit= og forsidens filtre (T03, #98, #102). Samme søk som forsiden, men svarer med
// JSON, så nettleseren kan hente treff uten å laste siden på nytt (live søkeforslag, #104).
// Kontrakten står i wireframe-README. Vakten requireApiUser står foran i worker.tsx.
import type { RequestInfo } from "rwsdk/worker";
import { z } from "zod";
import { db } from "@/db";
import { matchesFilters } from "./filter-listings";
import { getActiveListings, type ListingWithOwner } from "./queries";
import { pricesInOrder, searchFields, searchInput } from "./search-params";
import { searchListings } from "./search-listings";

// Samme søk og filtre som forsiden (#102), pluss limit.
const apiSchema = searchFields
  .extend({ limit: z.coerce.number().int().min(1).max(50).optional() })
  .refine(pricesInOrder);

// Bare disse feltene sendes; nye kolonner må legges til her med vilje.
function toJson({ listing }: ListingWithOwner) {
  const { id, title, type, price, status } = listing;
  return { id, title, type, price, status };
}

export async function getListings({ request }: RequestInfo) {
  const url = new URL(request.url);
  const parsed = apiSchema.safeParse({ ...searchInput(url), limit: url.searchParams.get("limit") ?? undefined });
  if (!parsed.success) return Response.json({ error: "Ugyldig søk." }, { status: 400 });
  const { q, limit, ...filters } = parsed.data;
  const hits = searchListings(await getActiveListings(db), q)
    .filter(({ listing }) => matchesFilters(listing, filters))
    .slice(0, limit);
  return Response.json({ listings: hits.map(toJson) });
}
