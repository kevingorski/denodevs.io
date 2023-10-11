import { State } from "@/routes/_middleware.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { deleteDeveloperSession } from "@/utils/db.ts";
import { Developer } from "@/types/Developer.ts";
import { redirectToDeveloperSignIn } from "@/utils/redirect.ts";
import { deleteCookie } from "https://deno.land/std@0.200.0/http/cookie.ts";
import { SITE_COOKIE_NAME } from "kv_oauth/src/core.ts";
import getDeveloperFromSessionId, {
  DeveloperSessionResult,
} from "@/utils/getDeveloperFromSessionId.ts";

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
  const redirectResponse = redirectToDeveloperSignIn(req.url);
  const { sessionId } = ctx.state;
  const maybeDeveloper = await getDeveloperFromSessionId(sessionId);

  switch (maybeDeveloper) {
    case DeveloperSessionResult.NO_SESSION_ID:
      return redirectResponse;
    case DeveloperSessionResult.NO_SESSION:
      deleteCookie(redirectResponse.headers, SITE_COOKIE_NAME);
      return redirectResponse;
    case DeveloperSessionResult.EXPIRED_SESSION:
      return await deleteSessionAndCookie(sessionId, redirectResponse);
    case DeveloperSessionResult.NO_DEVELOPER:
      return await deleteSessionAndCookie(sessionId, redirectResponse);
    default:
      ctx.state.developer = maybeDeveloper;
      break;
  }

  return await ctx.next();
}
