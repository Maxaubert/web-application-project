// Sidene i innloggingsflyten. Serverkomponenter; skjemaene er små klientkomponenter.
import type { RequestInfo } from "rwsdk/worker";
import { PageShell } from "@/app/shared/page-shell";
import { AccountSetupForm } from "./AccountSetupForm";
import { CodeForm } from "./CodeForm";
import { LoginForm } from "./LoginForm";
import { readPendingEmail } from "./pending-email";
import { countryOptions } from "./phone";
import { getDevCode } from "./send-login-code";
import { redirectTo } from "./guards";

const heading = "text-center text-4xl font-bold tracking-tight text-balance";

export function LoginPage() {
  return (
    <PageShell>
      <h1 className={`${heading} mb-10`}>Logg inn</h1>
      <LoginForm />
    </PageShell>
  );
}

export function CodePage({ request }: RequestInfo) {
  const email = readPendingEmail(request.headers);
  if (!email) return redirectTo("/login");
  return (
    <PageShell>
      <h1 className={heading}>Sjekk e-posten</h1>
      <p className="mt-3 mb-10 text-center text-lg">
        Kode sendt til
        <strong className="block font-semibold [overflow-wrap:anywhere]">{email}</strong>
      </p>
      <CodeForm devCode={getDevCode(email)} />
    </PageShell>
  );
}

export function AccountSetupPage({ ctx }: RequestInfo) {
  return (
    <PageShell>
      <h1 className="mb-10 text-4xl font-bold tracking-tight text-balance">Fullfør kontoen</h1>
      <AccountSetupForm email={ctx.session.email ?? ""} countries={countryOptions()} />
    </PageShell>
  );
}
