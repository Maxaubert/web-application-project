// Lånepris etter kravspesifikasjonen: ukepris delt på 7, ganget med antall dager.
// Uten ukepris er lånet gratis. Avrunding er ikke avklart, så verdien returneres uavrundet.
export function loanPrice(weeklyPrice: number | null, days: number): number {
  if (!Number.isInteger(days) || days < 1) {
    throw new Error("Antall dager må være et helt tall fra 1 og opp");
  }
  if (!weeklyPrice) return 0;
  return (weeklyPrice / 7) * days;
}
