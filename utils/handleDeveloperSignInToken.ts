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
  SESSION_COOKIE_LIFETIME_MS,
  SIGN_IN_TOKEN_LIFETIME_MS,
  USE_SECURE_COOKIES,
} from "@/utils/constants.ts";
import { SITE_COOKIE_NAME } from "kv_oauth/src/core.ts";
import {
  redirect,
  redirectToDeveloperSignIn,
  redirectToDeveloperSignUp,
} from "@/utils/redirect.ts";

export default async function handleDeveloperSignInToken(
  req: Request,
) {
  const requestUrl = new URL(req.url);
  const token = requestUrl.searchParams.get("token");
  if (!token) {
    return new Response(null, {
      status: 400,
    });
  }

  const signInToken = await getDeveloperSignInToken(token);
  const signInResponse = redirectToDeveloperSignIn();
  if (!signInToken) return signInResponse;

  await deleteSignInToken(token);

  if ((signInToken.generated + SIGN_IN_TOKEN_LIFETIME_MS) < Date.now()) {
    return signInResponse;
  }

  const developer = await getDeveloper(signInToken.entityId);
  if (!developer) {
    return redirectToDeveloperSignUp();
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
      maxAge: SESSION_COOKIE_LIFETIME_MS,
      sameSite: "Strict",
      name: SITE_COOKIE_NAME,
      value: session.uuid,
    },
  );

  return response;
}
