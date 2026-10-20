// Antall dager og pris for en låneperiode (#186), brukt av lånesiden og forespørselssiden. Avrundet opp til hele kroner
// (Max 20.10: utlåneren skal aldri få mindre enn ukeprisen), mens loanPrice returnerer uavrundet.
import { loanPrice } from "@/app/shared/loanPrice";
import { loanDays } from "./offer-rules";

export type LoanSummary = { days: number; price: number };

// null når perioden ikke er fylt ut ennå eller er ugyldig (ikke en ekte dato, eller til før fra).
export function loanSummary(startDate: string, endDate: string, weeklyPrice: number | null): LoanSummary | null {
  let days: number;
  try {
    days = loanDays(startDate, endDate);
  } catch {
    return null;
  }
  if (days < 1) return null;
  return { days, price: Math.ceil(loanPrice(weeklyPrice, days)) };
}

export const formatLoanPrice = (price: number) => (price === 0 ? "Gratis" : `${price.toLocaleString("nb-NO")} kr`);
