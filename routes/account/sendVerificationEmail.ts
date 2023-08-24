import type { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import type { AccountState } from "@/routes/account/_middleware.ts";
import { createUserLoginToken } from "@/utils/db.ts";
import { sendDevEmailVerificationMessage } from "@/utils/email.ts";

async function postHandler(
  req: Request,
  ctx: HandlerContext<PageProps<undefined>, AccountState>,
) {
  const { user } = ctx.state;
  if (user.emailConfirmed) {
    return new Response(null, { status: 400 });
  }

  const token = await createUserLoginToken(user);
  await sendDevEmailVerificationMessage(user, token.uuid);

  return new Response(null, { status: 200 });
}

export const handler: Handlers<PageProps, AccountState> = {
  POST: postHandler,
};
