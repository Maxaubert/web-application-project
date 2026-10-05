// Tilgangsvakter for sider (T04/T05, AK-02). Andre funksjoner importerer herfra.
// Ren logikk uten database, så den kan testes uten Cloudflare.
import type { RequestInfo } from "rwsdk/worker";

export type AppSession = {
  userId: string | null;
  email: string | null;
  name: string | null;
  needsSetup: boolean;
  isAuthenticated: boolean;
};

export const anonymousSession: AppSession = {
  userId: null,
  email: null,
  name: null,
  needsSetup: false,
  isAuthenticated: false,
};

type GuardInput = Pick<RequestInfo, "ctx">;

export function redirectTo(location: string): Response {
  return new Response(null, { status: 302, headers: { Location: location } });
}

// For sider som krever innlogget bruker med fullført konto.
export function requireUser({ ctx }: GuardInput) {
  if (!ctx.session.isAuthenticated) return redirectTo("/login");
  if (ctx.session.needsSetup) return redirectTo("/account-setup");
}

// For kontooppsettet: innlogget, men oppsettet er ikke gjort.
export function requireSetupPending({ ctx }: GuardInput) {
  if (!ctx.session.isAuthenticated) return redirectTo("/login");
  if (!ctx.session.needsSetup) return redirectTo("/");
}

// For innloggingssidene: er du allerede logget inn, sendes du videre.
export function requireAnonymous({ ctx }: GuardInput) {
  if (ctx.session.isAuthenticated) return redirectTo(ctx.session.needsSetup ? "/account-setup" : "/");
}
