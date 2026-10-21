// Delene av forespørselssiden (#192): banneret, budkortet, kontaktkortet og bekreftelsene (#188). Bare visning.
import type { Banner } from "./request-view";

export function StatusBanner({ banner }: { banner: Banner }) {
  // Mørk kant når det er din tur, lys kant når du venter eller forespørselen er avsluttet. Ikke fylt: en mørk flate
  // ser ut som en knapp (Max 18.10, #187). role="status": skjermlesere leser det opp.
  const tone = `border-2 bg-surface text-ink ${banner.yourTurn ? "border-ink" : "border-hairline"}`;
  return (
    <p role="status" className={`rounded-xl px-4 py-4 text-lg font-bold [overflow-wrap:anywhere] ${tone}`}>
      {banner.text}
    </p>
  );
}

type ContactCardProps = { name: string; email: string; phone: string | null };

// Den andre partens kontaktinfo etter godtatt forespørsel (FK-08, #188). Telefon og e-post er lenker som åpner ringing og e-post.
export function ContactCard({ name, email, phone }: ContactCardProps) {
  return (
    <div className="space-y-2 rounded-xl border-2 border-hairline bg-surface px-4 py-3.5">
      <p className="text-lg font-bold [overflow-wrap:anywhere]">Kontakt {name.split(" ")[0]} for å avtale overlevering</p>
      <dl className="space-y-1">
        <div>
          <dt className="text-sm text-muted">Navn</dt>
          <dd className="text-lg [overflow-wrap:anywhere]">{name}</dd>
        </div>
        {phone && (
          <div>
            <dt className="text-sm text-muted">Telefon</dt>
            <dd className="text-lg">
              <a href={`tel:${phone}`} className="inline-flex min-h-11 items-center underline hover:decoration-2">
                {phone}
              </a>
            </dd>
          </div>
        )}
        <div>
          <dt className="text-sm text-muted">E-post</dt>
          <dd className="text-lg [overflow-wrap:anywhere]">
            <a href={`mailto:${email}`} className="inline-flex min-h-11 items-center underline hover:decoration-2">
              {email}
            </a>
          </dd>
        </div>
      </dl>
    </div>
  );
}

type HandoverStatusProps = { youConfirmed: boolean; otherName: string; otherConfirmed: boolean };

// Hvem som har bekreftet overleveringen, som vanlig tekst uten farge (Max: ingen farger i status).
export function HandoverStatus({ youConfirmed, otherName, otherConfirmed }: HandoverStatusProps) {
  return (
    <dl className="grid grid-cols-2 gap-4 rounded-xl border-2 border-hairline bg-surface px-4 py-3.5">
      <div>
        <dt className="text-sm text-muted">Du</dt>
        <dd className="text-lg font-bold">{youConfirmed ? "Bekreftet" : "Ikke bekreftet"}</dd>
      </div>
      <div>
        <dt className="text-sm text-muted [overflow-wrap:anywhere]">{otherName.split(" ")[0]}</dt>
        <dd className="text-lg font-bold">{otherConfirmed ? "Bekreftet" : "Ikke bekreftet"}</dd>
      </div>
    </dl>
  );
}

type OfferCardProps = { bidLabel: string; bid: string; priceLabel: string; price: string };

export function OfferCard({ bidLabel, bid, priceLabel, price }: OfferCardProps) {
  return (
    <dl className="grid grid-cols-2 gap-4 rounded-xl border-2 border-hairline bg-surface px-4 py-3.5">
      <div>
        <dt className="text-sm text-muted">{bidLabel}</dt>
        <dd className="text-2xl font-bold">{bid}</dd>
      </div>
      <div>
        <dt className="text-sm text-muted">{priceLabel}</dt>
        <dd className="text-2xl font-bold">{price}</dd>
      </div>
    </dl>
  );
}
