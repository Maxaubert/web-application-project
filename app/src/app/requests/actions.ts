"use server";
// Serverhandlingen sendBid (FK-04): inngangsdøren fra budskjemaet. Den henter brukeren fra økten, aldri fra
// skjemaet, og gir jobben videre til placeBid, der reglene ligger. Her skjer bare det som hører til nettforespørselen.
import { getRequestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { redirect, type ActionResult } from "@/app/auth/form-state";
import { log } from "@/app/shared/log";
import { cancelRequest, confirmHandover } from "./handover";
import { placeBid } from "./place-bid";
import { placeRequest } from "./place-request";
import { confirmReturn } from "./return";
import { respondToOffer, type RespondAction } from "./respond";
import { noticeMarkers } from "./request-view";
import { withdrawRequest } from "./withdraw";
import { notifyOtherParty } from "@/app/notifications/notify";
import type { NotifyEvent } from "@/app/notifications/messages";
import { getEmailSender } from "@/app/notifications/sender";
import { getActiveRequest } from "./find-requests";

// E-postvarsel til motparten (FK-12, #232) etter at handlingen er lagret. waitUntil sender det etter svaret til nettleseren
// (Max 01.11), så Resend aldri gjør handlingen tregere; en feil logges i notifyOtherParty og angrer ingenting.
function notifyLater(actorId: string, event: NotifyEvent, requestId: () => Promise<string | undefined>) {
  const { cf, request } = getRequestInfo();
  const origin = new URL(request.url).origin;
  cf.waitUntil(
    requestId().then((id) => (id ? notifyOtherParty(db, getEmailSender(), { requestId: id, actorId, event, origin }) : undefined)),
  );
}

// Svarene som varsles; Trekk tilbake, bekreftelser og retur sender ikke noe (Max 01.11).
const notifyOnRespond: Record<string, NotifyEvent> = { accept: "accepted", decline: "declined", counter: "counter" };

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
  const userId = ctx.session.userId;
  notifyLater(userId, "new", async () => (await getActiveRequest(db, listingId, userId))?.id);
  return redirect(`/listings/${listingId}`);
}

// Låneforespørsel (periode) og gis bort (#186): samme mønster som sendBid, men med datoene fra skjemaet. For gis bort
// er det bare listingId som gjelder; felt som ikke hører til handelstypen avvises i placeRequest.
export async function sendRequest(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx } = getRequestInfo();
  if (!ctx.session.isAuthenticated || !ctx.session.userId) return redirect("/login");
  if (ctx.session.needsSetup) return redirect("/account-setup");

  const listingId = String(formData.get("listingId") ?? "");
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");

  const result = await placeRequest(db, { userId: ctx.session.userId, listingId, startDate, endDate });
  if (!result.ok) return { error: result.error, fieldErrors: result.fieldErrors, values: { startDate, endDate } };

  log.info("request_sent", { userId: ctx.session.userId, listingId });
  const userId = ctx.session.userId;
  notifyLater(userId, "new", async () => (await getActiveRequest(db, listingId, userId))?.id);
  return redirect(`/listings/${listingId}`);
}

// Godta, avslå eller motbud på forespørselssiden (#187). Samme rolle som sendBid: bare nettforespørselen her, reglene i respondToOffer.
export async function respondToRequest(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx } = getRequestInfo();
  if (!ctx.session.isAuthenticated || !ctx.session.userId) return redirect("/login");
  if (ctx.session.needsSetup) return redirect("/account-setup");

  const requestId = String(formData.get("requestId") ?? "");
  const price = String(formData.get("price") ?? "");
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const action = String(formData.get("intent") ?? "");

  const result = await respondToOffer(db, {
    userId: ctx.session.userId,
    requestId,
    offerId: String(formData.get("offerId") ?? ""),
    action,
    price,
    startDate,
    endDate,
  });
  if (!result.ok) return { error: result.error, fieldErrors: result.fieldErrors, values: { price, startDate, endDate } };

  log.info("request_answered", { userId: ctx.session.userId, requestId, action });
  if (Object.hasOwn(notifyOnRespond, action)) notifyLater(ctx.session.userId, notifyOnRespond[action], async () => requestId);
  // Markøren får siden til å vise «Motbud sendt» og lignende (#203).
  return redirect(`/requests/${requestId}?sendt=${noticeMarkers[action as RespondAction]}`);
}

const updateActions = { confirm: confirmHandover, cancel: cancelRequest, withdraw: withdrawRequest, return: confirmReturn } as const;
type UpdateAction = keyof typeof updateActions;

// Bekreft overlevering, avbestill, trekk tilbake (#188) og bekreft retur (#214): én handling med valget som skjemafelt,
// som respondToRequest. Reglene ligger i confirmHandover, cancelRequest, withdrawRequest og confirmReturn.
export async function updateRequest(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx } = getRequestInfo();
  if (!ctx.session.isAuthenticated || !ctx.session.userId) return redirect("/login");
  if (ctx.session.needsSetup) return redirect("/account-setup");

  const requestId = String(formData.get("requestId") ?? "");
  const action = String(formData.get("intent") ?? "");
  if (!Object.hasOwn(updateActions, action)) return { error: "Ukjent handling" };

  const result = await updateActions[action as UpdateAction](db, { userId: ctx.session.userId, requestId });
  if (!result.ok) return { error: result.error };

  log.info("request_updated", { userId: ctx.session.userId, requestId, action });
  if (action === "cancel") notifyLater(ctx.session.userId, "cancelled", async () => requestId);
  return redirect(`/requests/${requestId}?sendt=${noticeMarkers[action as UpdateAction]}`);
}
