// Finner innlogget bruker for hver forespørsel og legger den på ctx.session.
import type { RequestInfo } from "rwsdk/worker";
import { anonymousSession } from "./guards";
import { getAuth } from "./instance";

export async function sessionMiddleware({ request, ctx }: RequestInfo) {
  const result = await getAuth().api.getSession({ headers: request.headers });
  const user = result?.user as { id: string; email: string; name: string; phone?: string | null } | undefined;
  ctx.session = user
    ? { userId: user.id, email: user.email, name: user.name, needsSetup: !user.phone, isAuthenticated: true }
    : anonymousSession;
}
