import type { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import type { AccountState } from "@/routes/account/_middleware.ts";
import { createDeveloperSignInToken } from "@/utils/db.ts";
import { sendDeveloperEmailVerificationMessage } from "@/utils/email.ts";

async function postHandler(
  _req: Request,
  ctx: HandlerContext<PageProps<undefined>, AccountState>,
) {
  const { developer } = ctx.state;
  if (developer.emailConfirmed) {
    return new Response(null, { status: 400 });
  }

  const token = await createDeveloperSignInToken(developer);
  await sendDeveloperEmailVerificationMessage(developer, token.uuid);

  return new Response(null, { status: 200 });
}

export const handler: Handlers<PageProps, AccountState> = {
  POST: postHandler,
};
