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
import { deleteCookie } from "https://deno.land/std@0.200.0/http/cookie.ts";
import { SITE_COOKIE_NAME } from "kv_oauth/src/core.ts";

export interface AccountState extends State {
  sessionId: string;
  developer: Developer;
}

async function deleteSessionAndCookie(sessionId: string, response: Response) {
  await deleteDeveloperSession(sessionId);
  deleteCookie(response.headers, SITE_COOKIE_NAME);
  return response;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<AccountState>,
) {
  const redirectResponse = redirectToDevSignIn(req.url);
  const { sessionId } = ctx.state;
  if (!sessionId) return redirectResponse;

  const session = await getDeveloperSession(sessionId);
  if (!session) {
    deleteCookie(redirectResponse.headers, SITE_COOKIE_NAME);
    return redirectResponse;
  }

  // TODO: Separate value or generic name?
  if (
    session.generated + EMPLOYER_SESSION_COOKIE_LIFETIME_MS < Date.now()
  ) {
    // TODO: message for expired session
    return await deleteSessionAndCookie(sessionId, redirectResponse);
  }

  const developer = await getDeveloper(session.entityId);

  // TODO: message for developer not found?
  if (!developer) {
    return await deleteSessionAndCookie(sessionId, redirectResponse);
  }

  ctx.state.developer = developer;
  return await ctx.next();
}
