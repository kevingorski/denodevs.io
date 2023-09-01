import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import {
  createUserSession,
  deleteSignInToken,
  getUser,
  getUserSignInToken,
  updateUser,
} from "@/utils/db.ts";
import { setCookie } from "std/http/cookie.ts";
import {
  EMPLOYER_SESSION_COOKIE_LIFETIME_MS,
  USE_SECURE_COOKIES,
} from "@/utils/constants.ts";
import { SITE_COOKIE_NAME } from "kv_oauth/src/core.ts";

export const handler: Handlers = {
  async GET(req: Request, ctx: HandlerContext) {
    const tokenIssueResponse = new Response(null, {
      status: 400,
    });
    const requestUrl = new URL(req.url);
    const token = requestUrl.searchParams.get("token");
    if (!token) return tokenIssueResponse;

    const signInToken = await getUserSignInToken(token);
    if (!signInToken) return tokenIssueResponse;

    await deleteSignInToken(token);

    const user = await getUser(signInToken.entityId);
    if (!user) {
      return tokenIssueResponse;
    }
    if (!user.emailConfirmed) {
      user.emailConfirmed = true;
      await updateUser(user);
    }

    const session = await createUserSession(user.id);

    ctx.state.sessionId = session.uuid;

    const response = await ctx.render();

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
