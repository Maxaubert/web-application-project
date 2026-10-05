// Forsiden. Beskyttet av requireUser; blir annonseoversikten i neste del (FK-02).
import type { RequestInfo } from "rwsdk/worker";
import { LogoutButton } from "@/app/auth/LogoutButton";
import { PageShell } from "@/app/shared/page-shell";

export function HomePage({ ctx }: RequestInfo) {
  return (
    <PageShell>
      <h1 className="text-4xl font-bold tracking-tight text-balance">Du er logget inn</h1>
      <p className="mt-3 mb-10 text-lg">Hei, {ctx.session.name}. Annonsene kommer her.</p>
      <LogoutButton />
    </PageShell>
  );
}
