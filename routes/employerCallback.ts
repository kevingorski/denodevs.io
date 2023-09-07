import { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import {
  deleteRedirectUrlCookie,
  getRedirectUrlCookie,
  redirect,
  redirectToEmployerSignIn,
} from "@/utils/redirect.ts";
import {
  createEmployerSession,
  deleteSignInToken,
  getEmployer,
  getEmployerSignInToken,
} from "@/utils/db.ts";
import { setCookie } from "std/http/cookie.ts";
import {
  EMPLOYER_SESSION_COOKIE_NAME,
  LOGIN_TOKEN_LIFETIME_MS,
  SESSION_COOKIE_LIFETIME_MS,
  USE_SECURE_COOKIES,
} from "@/utils/constants.ts";
import { addEmployerEmailToResponse } from "@/utils/signInHelp.ts";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
  async GET(req) {
    const loginResponse = redirectToEmployerSignIn();
    const requestUrl = new URL(req.url);
    const token = requestUrl.searchParams.get("token");
    if (!token) return loginResponse;

    const loginToken = await getEmployerSignInToken(token);
    if (!loginToken) return loginResponse;

    await deleteSignInToken(token);

    if ((loginToken.generated + LOGIN_TOKEN_LIFETIME_MS) < Date.now()) {
      // TODO: message for expired token
      return loginResponse;
    }

    const redirectUrl = getRedirectUrlCookie(req.headers) || "/employer";
    const response = redirect(redirectUrl);

    deleteRedirectUrlCookie(response.headers);

    const [employer, session] = await Promise.all([
      getEmployer(loginToken.entityId),
      createEmployerSession(loginToken.entityId),
    ]);

    if (!employer) {
      return loginResponse;
    }

    setCookie(
      response.headers,
      {
        path: "/",
        httpOnly: true,
        secure: USE_SECURE_COOKIES,
        maxAge: SESSION_COOKIE_LIFETIME_MS,
        sameSite: "Strict",
        name: EMPLOYER_SESSION_COOKIE_NAME,
        value: session.uuid,
      },
    );

    addEmployerEmailToResponse(req, response, employer.email);

    return response;
  },
};
