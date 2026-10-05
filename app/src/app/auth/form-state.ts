// Svaret fra en serverhandling: enten feil til skjemaet, eller en videresending.
// RedwoodSDK følger en returnert 302-respons i nettleseren.
// values sendes tilbake ved feil, fordi React 19 tømmer skjemaet etter hver innsending.
export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
  // Bare lokal utvikling: ny kode etter «Send ny kode», vist i nettleserkonsollen.
  devCode?: string;
};
export type ActionResult = FormState | Response;

export function redirect(location: string): Response {
  return new Response(null, { status: 302, headers: { Location: location } });
}

// I nettleseren er tilstanden alltid et FormState (en videresending forlater siden).
export function asFormState(state: ActionResult | undefined): FormState {
  return state && !(state instanceof Response) ? state : {};
}
