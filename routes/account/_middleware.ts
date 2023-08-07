
import { State } from "@/routes/_middleware.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getUserBySession, User } from "@/utils/db.ts";
import { redirectToDevLogin } from "@/utils/redirect.ts";

export interface AccountState extends State {
  sessionId: string;
  user: User;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<AccountState>,
) {
  const redirectResponse = redirectToDevLogin(req.url);
  if (!ctx.state.sessionId) return redirectResponse;
  const user = await getUserBySession(ctx.state.sessionId);
  if (!user) return redirectResponse;
  ctx.state.user = user;
  return await ctx.next();
}
