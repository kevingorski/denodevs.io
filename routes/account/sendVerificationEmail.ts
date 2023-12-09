import type { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import type { AccountState } from "@/routes/account/_middleware.ts";
import { createSignInToken, updateDeveloper } from "@/utils/db.ts";
import {
  hasEmail,
  sendDeveloperEmailVerificationMessage,
} from "@/utils/email.ts";
import { STATUS_CODE } from "std/http/status.ts";

async function postHandler(
  _req: Request,
  ctx: HandlerContext<PageProps<undefined>, AccountState>,
) {
  const { developer } = ctx.state;
  const email = (await _req.json())?.email;
  if (typeof email !== "string" || email.length === 0) {
    return new Response(null, { status: STATUS_CODE.BadRequest });
  }
  if (developer.emailConfirmed && developer.email === email) {
    return new Response(null, { status: STATUS_CODE.NotModified });
  }

  developer.email = email;
  developer.emailConfirmed = false;
  await updateDeveloper(developer);

  const token = await createSignInToken(developer);

  if (hasEmail(developer)) {
    await sendDeveloperEmailVerificationMessage(developer, token.uuid);

    return new Response(null, { status: STATUS_CODE.OK });
  }

  // Despite trying to assign an email, none was available
  console.error(`No email in "${email}"`);
  return new Response(null, { status: STATUS_CODE.InternalServerError });
}

export const handler: Handlers<PageProps, AccountState> = {
  POST: postHandler,
};
