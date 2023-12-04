import { State } from "@/routes/_middleware.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { Developer } from "@/types/Developer.ts";
import { redirectToDeveloperSignIn } from "@/utils/redirect.ts";
import getDeveloperFromSessionId, {
  DeveloperSessionResult,
} from "@/utils/getDeveloperFromSessionId.ts";
import { signOut } from "kv_oauth/mod.ts";

export interface AccountState extends State {
  sessionId: string;
  developer: Developer;
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
      console.error("No session ID");
      return redirectResponse;
    case DeveloperSessionResult.NO_DEVELOPER:
      console.error("No developer");
      return await signOut(req);
    default:
      ctx.state.developer = maybeDeveloper;
      break;
  }

  return await ctx.next();
}
