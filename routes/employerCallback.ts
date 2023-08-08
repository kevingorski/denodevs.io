import { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import {
  deleteRedirectUrlCookie,
  getRedirectUrlCookie,
  redirect,
  redirectToEmployerLogin,
} from "@/utils/redirect.ts";
import { deleteEmployerLoginToken, getEmployerLoginToken } from "@/utils/db.ts";
import { setCookie } from "https://deno.land/std@0.192.0/http/cookie.ts";
import {
  EMPLOYER_SESSION_COOKIE_LIFETIME_MS,
  EMPLOYER_SESSION_COOKIE_NAME,
} from "@/utils/constants.ts";

const employerSessionCookieSecure =
  Deno.env.get("EMPLOYER_SESSION_COOKIE_SECURE") !== "false";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
  async GET(req) {
    const loginResponse = redirectToEmployerLogin();
    const requestUrl = new URL(req.url);
    const token = requestUrl.searchParams.get("token");
    if (!token) return loginResponse;

    const loginToken = await getEmployerLoginToken(token);
    if (!loginToken) return loginResponse;

    if (loginToken.expires < Date.now()) {
      await deleteEmployerLoginToken(token);
      // TODO: message for expired token
      return loginResponse;
    }

    await deleteEmployerLoginToken(token);

    const redirectUrl = getRedirectUrlCookie(req.headers) || "/employer";
    const response = redirect(redirectUrl);

    deleteRedirectUrlCookie(response.headers);

    setCookie(
      response.headers,
      {
        path: "/",
        httpOnly: true,
        secure: employerSessionCookieSecure,
        maxAge: EMPLOYER_SESSION_COOKIE_LIFETIME_MS,
        sameSite: "Lax",
        name: EMPLOYER_SESSION_COOKIE_NAME,
        value: loginToken.sessionId,
      },
    );

    return response;
  },
};
