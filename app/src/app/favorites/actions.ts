"use server";
// Serverhandlingen toggleFavorite (FK-14, #224): inngangsdøren fra hjertet. Den henter brukeren fra økten, aldri fra
// skjemaet, og gir jobben videre til setFavorite, der reglene ligger. Hjertet kommer i neste PR.
import { getRequestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { redirect, type ActionResult } from "@/app/auth/form-state";
import { log } from "@/app/shared/log";
import { setFavorite } from "./favorites";

export async function toggleFavorite(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx } = getRequestInfo();
  if (!ctx.session.isAuthenticated || !ctx.session.userId) return redirect("/login");
  if (ctx.session.needsSetup) return redirect("/account-setup");

  const listingId = String(formData.get("listingId") ?? "");
  const intent = String(formData.get("intent") ?? "");
  if (intent !== "on" && intent !== "off") return { error: "Ukjent handling" };

  const result = await setFavorite(db, { userId: ctx.session.userId, listingId, on: intent === "on" });
  if (!result.ok) return { error: result.error };

  log.info("favorite_toggled", { userId: ctx.session.userId, listingId, intent });
  return {};
}
