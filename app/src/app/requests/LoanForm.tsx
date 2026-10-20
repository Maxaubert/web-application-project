"use client";
// Skjemaet på lånesiden (WF-06 for lån, #186): annonsekortet, opptatte perioder som tekst og periodefeltene
// (PeriodFields). Alt valideres på nytt i serverhandlingen sendRequest; feilene derfra vises under feltene.
import { useActionState } from "react";
import { asFormState, type ActionResult } from "@/app/auth/form-state";
import { PrimaryButton } from "@/app/shared/form-controls";
import { sendRequest } from "./actions";
import type { Period } from "./occupied";
import { ListingSummary } from "./ListingSummary";
import { PeriodFields } from "./PeriodFields";
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
      <PeriodFields
        idPrefix="loan"
        weeklyPrice={weeklyPrice}
        initialStart={state.values?.startDate}
        initialEnd={state.values?.endDate}
        errors={{ startDate: state.fieldErrors?.startDate, endDate: state.fieldErrors?.endDate, form: state.error }}
      />
      <PrimaryButton pending={pending}>Send forespørsel</PrimaryButton>
    </form>
  );
}
