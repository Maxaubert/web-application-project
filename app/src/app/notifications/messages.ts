// E-postvarslene (FK-12, D-65 til D-67, #232): tekst for hver hendelse. Ren funksjon uten database eller nettverk, så
// den kan testes alene. Bare navn, annonsetittel og lenke; aldri telefon eller e-post (de deles bare i appen etter aksept).
import type { Listing } from "@/db/schema";

// De fem hendelsene i FK-12 (Max 01.11). Trekk tilbake og utløp sender ikke noe.
export type NotifyEvent = "new" | "counter" | "accepted" | "declined" | "cancelled";

type MessageInput = { event: NotifyEvent; type: Listing["type"]; actorName: string; title: string; link: string };
export type Message = { subject: string; text: string };

// Ved salg er en ny forespørsel et bud; ved lån og gis bort en forespørsel.
const newSubject = (type: Listing["type"]) => (type === "sale" ? "Nytt bud" : "Ny forespørsel");

export function composeMessage({ event, type, actorName, title, link }: MessageInput): Message {
  const subjects: Record<NotifyEvent, string> = {
    new: `${newSubject(type)} på «${title}»`,
    counter: `Motbud på «${title}»`,
    accepted: `Godtatt: «${title}»`,
    declined: `Avslått: «${title}»`,
    cancelled: `Avbestilt: «${title}»`,
  };
  const lines: Record<NotifyEvent, string> = {
    new: `${actorName} har sendt ${type === "sale" ? "et bud" : "en forespørsel"} på «${title}».`,
    counter: `${actorName} har sendt et motbud på «${title}».`,
    accepted: `${actorName} har godtatt avtalen om «${title}». Nå ser dere hverandres kontaktinfo i appen.`,
    declined: `${actorName} har avslått forespørselen om «${title}».`,
    cancelled: `${actorName} har avbestilt avtalen om «${title}».`,
  };
  return { subject: subjects[event], text: `${lines[event]}\n\nSe forespørselen: ${link}` };
}
