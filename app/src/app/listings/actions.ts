"use server";
// Serverhandlinger for annonser (FK-03, #131). Alt sjekkes her på serveren: økt, fullført konto og
// gyldige felt og bilder. Eieren hentes fra økten, aldri fra skjemaet, så ingen kan legge ut i andres navn.
import { eq } from "drizzle-orm";
import { getRequestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { listing, listingImage } from "@/db/schema";
import { redirect, type ActionResult } from "@/app/auth/form-state";
import { imageBucket } from "@/app/images/bucket";
import { checkImages, checkThumbs } from "@/app/images/image-files";
import { storeImages, withThumbs } from "@/app/images/storage";
import { log } from "@/app/shared/log";
import { validateListing, type ListingFormValues } from "./listing-schema";
import { unpublishListing } from "./unpublish";
import { updateListingFields } from "./update";

const FIELDS = ["title", "description", "category", "type", "condition", "price"] as const;

export async function createListing(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx } = getRequestInfo();
  if (!ctx.session.isAuthenticated || !ctx.session.userId) return redirect("/login");
  if (ctx.session.needsSetup) return redirect("/account-setup");

  const values = Object.fromEntries(FIELDS.map((key) => [key, String(formData.get(key) ?? "")])) as ListingFormValues;
  const result = validateListing(values);
  // Bildene sjekkes også når feltene er feil, så brukeren får alle feilene samtidig (#138).
  const images = await checkImages(formData.getAll("images"));
  const thumbs =
    images.error === undefined ? await checkThumbs(formData.getAll("thumbs"), images.images.length) : { thumbs: [] as File[], error: undefined };
  const imageError = images.error ?? thumbs.error;
  if (!result.success || images.error !== undefined || thumbs.error !== undefined) {
    const fieldErrors = result.success ? {} : result.fieldErrors;
    if (imageError !== undefined) fieldErrors.images = imageError;
    return { fieldErrors, values };
  }

  // Bildene lagres først, under en ID vi lager selv. Feiler databasen etterpå, slettes både annonsen
  // og filene igjen, så det aldri blir liggende bilder uten annonse eller en annonse med halve bildene.
  const listingId = crypto.randomUUID();
  const keys = await storeImages(imageBucket, listingId, images.images, thumbs.thumbs);
  try {
    await db.insert(listing).values({ ...result.data, id: listingId, ownerId: ctx.session.userId });
    if (keys.length > 0) await db.insert(listingImage).values(keys.map((key, position) => ({ listingId, key, position })));
  } catch (error) {
    await db.delete(listing).where(eq(listing.id, listingId));
    if (keys.length > 0) await imageBucket.delete(withThumbs(keys));
    throw error;
  }
  log.info("listing_created", { userId: ctx.session.userId, listingId, images: keys.length });
  return redirect(`/listings/${listingId}?publisert=1`);
}

// «Slett annonse» i «Administrer» (#229): annonsen tas ned, dataene beholdes. Reglene ligger i unpublishListing; her skjer
// bare det som hører til nettforespørselen. Ved suksess til Mine annonser (Max 24.10).
export async function takeDownListing(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx } = getRequestInfo();
  if (!ctx.session.isAuthenticated || !ctx.session.userId) return redirect("/login");
  if (ctx.session.needsSetup) return redirect("/account-setup");

  const listingId = String(formData.get("listingId") ?? "");
  const result = await unpublishListing(db, { userId: ctx.session.userId, listingId });
  if (!result.ok) return { error: result.error };

  log.info("listing_unpublished", { userId: ctx.session.userId, listingId });
  return redirect("/me?tab=listings");
}

// «Administrer» (#229): lagre endringer i en egen annonse. Reglene ligger i updateListingFields; handelstypen er låst og
// leses ikke fra skjemaet. Ved suksess til annonsesiden, ved feil tilbake til skjemaet med det som var fylt inn.
export async function updateListing(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx } = getRequestInfo();
  if (!ctx.session.isAuthenticated || !ctx.session.userId) return redirect("/login");
  if (ctx.session.needsSetup) return redirect("/account-setup");

  const listingId = String(formData.get("listingId") ?? "");
  const values = Object.fromEntries(FIELDS.map((key) => [key, String(formData.get(key) ?? "")])) as ListingFormValues;
  const result = await updateListingFields(db, { userId: ctx.session.userId, listingId, values });
  if (!result.ok) return "fieldErrors" in result ? { fieldErrors: result.fieldErrors, values } : { error: result.error };

  log.info("listing_updated", { userId: ctx.session.userId, listingId });
  return redirect(`/listings/${listingId}`);
}
