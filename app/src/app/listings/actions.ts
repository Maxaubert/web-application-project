"use server";
// Serverhandlinger for annonser (FK-03, #131). Alt sjekkes her på serveren: økt, fullført konto og
// gyldige felt. Eieren hentes fra økten, aldri fra skjemaet, så ingen kan legge ut i andres navn.
import { getRequestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { listing } from "@/db/schema";
import { redirect, type ActionResult } from "@/app/auth/form-state";
import { log } from "@/app/shared/log";
import { validateListing, type ListingFormValues } from "./listing-schema";

const FIELDS = ["title", "description", "category", "type", "condition", "price"] as const;

export async function createListing(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx } = getRequestInfo();
  if (!ctx.session.isAuthenticated || !ctx.session.userId) return redirect("/login");
  if (ctx.session.needsSetup) return redirect("/account-setup");

  const values = Object.fromEntries(FIELDS.map((key) => [key, String(formData.get(key) ?? "")])) as ListingFormValues;
  const result = validateListing(values);
  if (!result.success) return { fieldErrors: result.fieldErrors, values };

  const [created] = await db
    .insert(listing)
    .values({ ...result.data, ownerId: ctx.session.userId })
    .returning({ id: listing.id });
  log.info("listing_created", { userId: ctx.session.userId, listingId: created.id });
  return redirect(`/listings/${created.id}?publisert=1`);
}
