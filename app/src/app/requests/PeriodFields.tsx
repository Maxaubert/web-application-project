"use client";
// «Fra» og «Til» med antall dager og pris under (#186, #208). Delt av lånesiden og motbudet på forespørselssiden.
// Datofeltene gir ÅÅÅÅ-MM-DD, som er det serveren venter; summen regnes ut mens man skriver. Feltene er kontrollerte,
// så de ikke tømmes når serveren avviser.
import { useState } from "react";
import { FieldError, TextField } from "@/app/shared/form-controls";
import { formatLoanPrice, loanSummary } from "./loan-summary";

type PeriodFieldsProps = {
  idPrefix: string;
  weeklyPrice: number | null;
  initialStart?: string;
  initialEnd?: string;
  errors?: { startDate?: string; endDate?: string; form?: string };
};

export function PeriodFields({ idPrefix, weeklyPrice, initialStart = "", initialEnd = "", errors }: PeriodFieldsProps) {
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const summary = loanSummary(startDate, endDate, weeklyPrice);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={`${idPrefix}-start`}
          name="startDate"
          type="date"
          label="Fra"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          error={errors?.startDate}
        />
        <TextField
          id={`${idPrefix}-end`}
          name="endDate"
          type="date"
          label="Til"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          error={errors?.endDate}
        />
      </div>
      <FieldError id={`${idPrefix}-error`} message={errors?.form} />
      {summary && (
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 rounded-xl border-2 border-ink bg-surface px-4 py-3.5 text-lg">
          <dt className="text-muted">Antall dager</dt>
          <dd className="text-2xl font-bold">{summary.days}</dd>
          <dt className="text-muted">Pris</dt>
          <dd className="text-2xl font-bold">{formatLoanPrice(summary.price)}</dd>
        </dl>
      )}
    </>
  );
}
