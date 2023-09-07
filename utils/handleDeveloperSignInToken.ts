import {
  createDeveloperSession,
  deleteSignInToken,
  getDeveloper,
  getDeveloperSignInToken,
  updateDeveloper,
} from "@/utils/db.ts";
import { addDeveloperEmailToResponse } from "@/utils/signInHelp.ts";
import { setCookie } from "std/http/cookie.ts";
import {
  EMPLOYER_SESSION_COOKIE_LIFETIME_MS,
  USE_SECURE_COOKIES,
} from "@/utils/constants.ts";
import { SITE_COOKIE_NAME } from "kv_oauth/src/core.ts";
import { redirect } from "@/utils/redirect.ts";

export default async function handleDeveloperSignInToken(
  req: Request,
) {
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
  const response = redirect("/account");

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
}
