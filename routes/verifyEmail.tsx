import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import {
  createDeveloperSession,
  deleteSignInToken,
  getDeveloper,
  getDeveloperSignInToken,
  updateDeveloper,
} from "@/utils/db.ts";
import { setCookie } from "std/http/cookie.ts";
import {
  EMPLOYER_SESSION_COOKIE_LIFETIME_MS,
  USE_SECURE_COOKIES,
} from "@/utils/constants.ts";
import { SITE_COOKIE_NAME } from "kv_oauth/src/core.ts";
import { addDeveloperEmailToResponse } from "@/utils/signInHelp.ts";

export const handler: Handlers = {
  async GET(req: Request, ctx: HandlerContext) {
    const tokenIssueResponse = new Response(null, {
      status: 400,
    });
    const requestUrl = new URL(req.url);
    const token = requestUrl.searchParams.get("token");
    if (!token) return tokenIssueResponse;

    const signInToken = await getDeveloperSignInToken(token);
    if (!signInToken) return tokenIssueResponse;

    await deleteSignInToken(token);

    const developer = await getDeveloper(signInToken.entityId);
    if (!developer) {
      return tokenIssueResponse;
    }
    if (!developer.emailConfirmed) {
      developer.emailConfirmed = true;
      await updateDeveloper(developer);
    }

    const session = await createDeveloperSession(developer.id);

    ctx.state.sessionId = session.uuid;

    const response = await ctx.render();
    addDeveloperEmailToResponse(req, response, developer.email);

    setCookie(
      response.headers,
      {
        path: "/",
        httpOnly: true,
        secure: USE_SECURE_COOKIES,
        // TODO: Separate value or generic name?
        maxAge: EMPLOYER_SESSION_COOKIE_LIFETIME_MS,
        sameSite: "Strict",
        name: SITE_COOKIE_NAME,
        value: session.uuid,
      },
    );

    return response;
  },
};

export default function VerifyEmailPage(props: PageProps) {
  // TODO: Consider different message for account creation flow
  return (
    <main>
      <h1>Email verified!</h1>
      <a href="/account">Return to your account</a>.
    </main>
  );
}
