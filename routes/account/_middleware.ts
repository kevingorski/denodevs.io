import { State } from "@/routes/_middleware.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import {
  deleteUserSession,
  getUser,
  getUserSession,
  User,
} from "@/utils/db.ts";
import { redirectToDevSignIn } from "@/utils/redirect.ts";
import { EMPLOYER_SESSION_COOKIE_LIFETIME_MS } from "@/utils/constants.ts";

export interface AccountState extends State {
  sessionId: string;
  user: User;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<AccountState>,
) {
  const redirectResponse = redirectToDevSignIn(req.url);
  const { sessionId } = ctx.state;
  if (!sessionId) return redirectResponse;

  const session = await getUserSession(sessionId);
  if (!session) return redirectResponse;

  // TODO: Separate value or generic name?
  if (
    session.generated + EMPLOYER_SESSION_COOKIE_LIFETIME_MS < Date.now()
  ) {
    await deleteUserSession(sessionId);
    // TODO: message for expired session
    return redirectResponse;
  }

  const user = await getUser(session.entityId);

  // TODO: message for user not found?
  if (!user) return redirectResponse;

  ctx.state.user = user;
  return await ctx.next();
}
