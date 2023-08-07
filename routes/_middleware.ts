
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getSessionId } from "kv_oauth";
import { getUserBySession, ifUserHasNotifications } from "@/utils/db.ts";
import type { MetaProps } from "@/components/Meta.tsx";
import { EMPLOYER_SESSION_COOKIE_NAME } from "@/utils/constants.ts";
import { getCookies } from "std/http/cookie.ts";

export interface State extends MetaProps {
  sessionId?: string;
  hasNotifications?: boolean;
  employerSessionId?: string;
}

async function setState(req: Request, ctx: MiddlewareHandlerContext<State>) {
  if (ctx.destination !== "route") return await ctx.next();

  const sessionId = await getSessionId(req);
  ctx.state.sessionId = sessionId;

  if (sessionId) {
    const user = await getUserBySession(sessionId);
    ctx.state.hasNotifications = await ifUserHasNotifications(user!.id);
  }

  const employerSessionId =
    getCookies(req.headers)[EMPLOYER_SESSION_COOKIE_NAME];

  if (employerSessionId) {
    ctx.state.employerSessionId = employerSessionId;
  }

  return await ctx.next();
}

export const handler = [
  setState,
];
