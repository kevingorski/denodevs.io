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
} from "@/utils/constants.ts";
import {
  redirect,
  redirectToDeveloperSignIn,
  redirectToDeveloperSignUp,
} from "@/utils/redirect.ts";
import { USE_SECURE_COOKIES } from "@/utils/config.ts";
import {
  getCookieName,
  isHttps,
  SITE_COOKIE_NAME,
} from "kv_oauth/lib/_http.ts";

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
  if (!signInToken) {
    console.error(`Failed to find developer sign in token: ${token}`);
    return signInResponse;
  }

  await deleteSignInToken(token);

  if ((signInToken.generated + SIGN_IN_TOKEN_LIFETIME_MS) < Date.now()) {
    console.error("Expired developer sign in token");
    return signInResponse;
  }

  const developer = await getDeveloper(signInToken.entityId);
  if (!developer) {
    console.error(`Failed to find developer: ${signInToken.entityId}`);
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
      name: getCookieName(SITE_COOKIE_NAME, isHttps(req.url)),
      value: session.uuid,
    },
  );

  return response;
}
