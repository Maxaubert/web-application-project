// Varsler den andre parten i en forespørsel (FK-12, #232). Mottakeren er alltid motparten til den som handlet, aldri den
// som handlet selv. Kalles fra serverhandlingene etter at handlingen er lagret, og en feil her logges uten å kastes:
// handlingen er allerede gjort, og et varsel som ikke kom frem, skal ikke angre den.
import type { Db } from "@/db/types";
import { log, maskEmail } from "@/app/shared/log";
import { composeMessage, type NotifyEvent } from "./messages";
import { createNotifyRepository } from "./repository";
import type { SendEmail } from "./sender";

type NotifyInput = { requestId: string; actorId: string; event: NotifyEvent; origin: string };

export async function notifyOtherParty(db: Db, send: SendEmail, { requestId, actorId, event, origin }: NotifyInput): Promise<void> {
  try {
    const found = await createNotifyRepository(db).findParties(requestId);
    // Bare de to partene kan handle; noe annet er en feil i kallet, og da sendes ingenting.
    if (!found || (actorId !== found.ownerId && actorId !== found.requesterId)) return;

    const actorIsOwner = actorId === found.ownerId;
    const to = actorIsOwner ? found.requesterEmail : found.ownerEmail;
    const actorName = actorIsOwner ? found.ownerName : found.requesterName;
    const message = composeMessage({ event, type: found.type, actorName, title: found.title, link: `${origin}/requests/${requestId}` });
    await send(to, message);
    log.info("notification_sent", { requestId, kind: event, to: maskEmail(to) });
  } catch (error) {
    log.warn("notification_failed", { requestId, kind: event, error: error instanceof Error ? error.message : String(error) });
  }
}
