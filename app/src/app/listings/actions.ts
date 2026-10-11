"use server";
// Serverhandlinger for annonser (FK-03, #131). Alt sjekkes her på serveren: økt, fullført konto og
// gyldige felt og bilder. Eieren hentes fra økten, aldri fra skjemaet, så ingen kan legge ut i andres navn.
import { eq } from "drizzle-orm";
import { getRequestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { listing, listingImage } from "@/db/schema";
import { redirect, type ActionResult } from "@/app/auth/form-state";
import { imageBucket } from "@/app/images/bucket";
import { checkImages } from "@/app/images/image-files";
import { storeImages } from "@/app/images/storage";
import { log } from "@/app/shared/log";
import { validateListing, type ListingFormValues } from "./listing-schema";

const FIELDS = ["title", "description", "category", "type", "condition", "price"] as const;

export async function createListing(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx } = getRequestInfo();
  if (!ctx.session.isAuthenticated || !ctx.session.userId) return redirect("/login");
  if (ctx.session.needsSetup) return redirect("/account-setup");

  const values = Object.fromEntries(FIELDS.map((key) => [key, String(formData.get(key) ?? "")])) as ListingFormValues;
  const result = validateListing(values);
  // Bildene sjekkes også når feltene er feil, så brukeren får alle feilene samtidig (#138).
  const images = await checkImages(formData.getAll("images"));
  if (!result.success || images.error !== undefined) {
    const fieldErrors = result.success ? {} : result.fieldErrors;
    if (images.error !== undefined) fieldErrors.images = images.error;
    return { fieldErrors, values };
  }

  // Bildene lagres først, under en ID vi lager selv. Feiler databasen etterpå, slettes både annonsen
  // og filene igjen, så det aldri blir liggende bilder uten annonse eller en annonse med halve bildene.
  const listingId = crypto.randomUUID();
  const keys = await storeImages(imageBucket, listingId, images.images);
  try {
    await db.insert(listing).values({ ...result.data, id: listingId, ownerId: ctx.session.userId });
    if (keys.length > 0) await db.insert(listingImage).values(keys.map((key, position) => ({ listingId, key, position })));
  } catch (error) {
    await db.delete(listing).where(eq(listing.id, listingId));
    if (keys.length > 0) await imageBucket.delete(keys);
    throw error;
  }
  log.info("listing_created", { userId: ctx.session.userId, listingId, images: keys.length });
  return redirect(`/listings/${listingId}?publisert=1`);
}
