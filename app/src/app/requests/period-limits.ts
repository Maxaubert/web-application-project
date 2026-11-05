// Hvilke datoer en låneperiode kan ha (#302): fra i dag, norsk tid, til og med 31.12 neste år.
// Samme grenser i skjemaet og i valideringen på serveren. ÅÅÅÅ-MM-DD kan sammenlignes som tekst.
const osloDay = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" });

export function periodLimits(now: Date) {
  const min = osloDay.format(now);
  return { min, max: `${Number(min.slice(0, 4)) + 1}-12-31` };
}
