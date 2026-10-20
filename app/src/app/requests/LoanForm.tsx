"use client";
// Skjemaet på lånesiden (WF-06 for lån, #186): annonsekortet, opptatte perioder som tekst, «Fra» og «Til» og
// summen. Datofeltene gir ÅÅÅÅ-MM-DD, som er det serveren venter. Alt valideres på nytt i serverhandlingen
// sendRequest; feilene derfra vises under feltene.
import { useActionState, useState } from "react";
import { asFormState, type ActionResult } from "@/app/auth/form-state";
import { FieldError, PrimaryButton, TextField } from "@/app/shared/form-controls";
import { sendRequest } from "./actions";
import { formatLoanPrice, loanSummary } from "./loan-summary";
import type { Period } from "./occupied";
import { ListingSummary } from "./ListingSummary";
import { formatPeriod } from "./request-view";

type LoanFormProps = {
  listingId: string;
  title: string;
  typeAndPrice: string;
  ownerName: string;
  thumb: string | null;
  weeklyPrice: number | null;
  occupied: Period[];
};

export function LoanForm({ listingId, title, typeAndPrice, ownerName, thumb, weeklyPrice, occupied }: LoanFormProps) {
  const [result, action, pending] = useActionState<ActionResult, FormData>(sendRequest, {});
  const state = asFormState(result);
  // Kontrollerte felt: summen regnes ut mens man skriver, og feltene tømmes ikke når serveren avviser.
  const [startDate, setStartDate] = useState(state.values?.startDate ?? "");
  const [endDate, setEndDate] = useState(state.values?.endDate ?? "");
  const summary = loanSummary(startDate, endDate, weeklyPrice);

  return (
    <form action={action} noValidate className="space-y-6">
      <input type="hidden" name="listingId" value={listingId} />
      <ListingSummary title={title} typeAndPrice={typeAndPrice} thumb={thumb} sellerName={ownerName} />
      {occupied.length > 0 && (
        <section className="rounded-xl border-2 border-hairline bg-surface px-4 py-3.5">
          <h2 className="mb-1 text-base font-bold">Opptatt</h2>
          <ul>
            {occupied.map((period) => (
              <li key={period.startDate}>{formatPeriod(period.startDate, period.endDate)}</li>
            ))}
          </ul>
        </section>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="loan-start"
          name="startDate"
          type="date"
          label="Fra"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          error={state.fieldErrors?.startDate}
        />
        <TextField
          id="loan-end"
          name="endDate"
          type="date"
          label="Til"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          error={state.fieldErrors?.endDate}
        />
      </div>
      <FieldError id="loan-error" message={state.error} />
      {summary && (
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 rounded-xl border-2 border-ink bg-surface px-4 py-3.5 text-lg">
          <dt className="text-muted">Antall dager</dt>
          <dd className="text-2xl font-bold">{summary.days}</dd>
          <dt className="text-muted">Pris</dt>
          <dd className="text-2xl font-bold">{formatLoanPrice(summary.price)}</dd>
        </dl>
      )}
      <PrimaryButton pending={pending}>Send forespørsel</PrimaryButton>
    </form>
  );
}
