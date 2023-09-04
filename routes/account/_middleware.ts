import { State } from "@/routes/_middleware.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import {
  deleteDeveloperSession,
  Developer,
  getDeveloper,
  getDeveloperSession,
} from "@/utils/db.ts";
import { redirectToDevSignIn } from "@/utils/redirect.ts";
import { EMPLOYER_SESSION_COOKIE_LIFETIME_MS } from "@/utils/constants.ts";

export interface AccountState extends State {
  sessionId: string;
  developer: Developer;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<AccountState>,
) {
  const redirectResponse = redirectToDevSignIn(req.url);
  const { sessionId } = ctx.state;
  if (!sessionId) return redirectResponse;

  const session = await getDeveloperSession(sessionId);
  if (!session) return redirectResponse;

  // TODO: Separate value or generic name?
  if (
    session.generated + EMPLOYER_SESSION_COOKIE_LIFETIME_MS < Date.now()
  ) {
    await deleteDeveloperSession(sessionId);
    // TODO: message for expired session
    return redirectResponse;
  }

  const developer = await getDeveloper(session.entityId);

  // TODO: message for developer not found?
  if (!developer) return redirectResponse;

  ctx.state.developer = developer;
  return await ctx.next();
}
