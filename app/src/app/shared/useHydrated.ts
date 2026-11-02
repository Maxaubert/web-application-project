// Om React har tatt over siden i nettleseren (#57). Serveren og den første tegningen gir false, så knapper kan være
// låst til skjemaet faktisk virker. Uten låsen sendte et tidlig klikk skjemaet uten JavaScript, og feilmeldingen kom
// aldri frem.
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
