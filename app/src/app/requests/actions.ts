"use server";
// Serverhandlingen sendBid (FK-04): inngangsdøren fra budskjemaet. Den henter brukeren fra økten, aldri fra
// skjemaet, og gir jobben videre til placeBid, der reglene ligger. Her skjer bare det som hører til nettforespørselen.
import { getRequestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { redirect, type ActionResult } from "@/app/auth/form-state";
import { log } from "@/app/shared/log";
import { placeBid } from "./place-bid";

export async function sendBid(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx } = getRequestInfo();
  if (!ctx.session.isAuthenticated || !ctx.session.userId) return redirect("/login");
  if (ctx.session.needsSetup) return redirect("/account-setup");

  const listingId = String(formData.get("listingId") ?? "");
  const price = String(formData.get("price") ?? "");

  const result = await placeBid(db, { userId: ctx.session.userId, listingId, price });
  // values sendes tilbake, for React 19 tømmer skjemaet etter hver innsending.
  if (!result.ok) return { error: result.error, fieldErrors: result.fieldErrors, values: { price } };

  log.info("bid_sent", { userId: ctx.session.userId, listingId });
  return redirect(`/listings/${listingId}`);
}
