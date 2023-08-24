import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import {
  deleteLoginToken,
  getUser,
  getUserLoginToken,
  updateUser,
} from "@/utils/db.ts";

export const handler: Handlers = {
  async GET(req: Request, ctx: HandlerContext) {
    const tokenIssueResponse = new Response(null, {
      status: 400,
    });
    const requestUrl = new URL(req.url);
    const token = requestUrl.searchParams.get("token");
    if (!token) return tokenIssueResponse;

    const loginToken = await getUserLoginToken(token);
    if (!loginToken) return tokenIssueResponse;

    // NB: not really a login token, expiration not so important

    await deleteLoginToken(token);

    const user = await getUser(loginToken.entityId);
    if (!user) {
      return tokenIssueResponse;
    }
    if (!user.emailConfirmed) {
      user.emailConfirmed = true;
      await updateUser(user);
    }

    return await ctx.render();
  },
};

export default function VerifyEmailPage(props: PageProps) {
  return (
    <main>
      <h1>Email verified!</h1>
      <a href="/account">Return to your account</a>.
    </main>
  );
}
