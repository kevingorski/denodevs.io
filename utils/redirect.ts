import { RedirectStatus, STATUS_CODE } from "std/http/status.ts";
import { deleteCookie, getCookies, setCookie } from "std/http/cookie.ts";

export const REDIRECT_URL_COOKIE_NAME = "redirect-url";

/**
 * @param location A relative (to the request URL) or absolute URL.
 * @param status HTTP status
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location}
 */
export function redirect(
  location: string,
  status: RedirectStatus = STATUS_CODE.SeeOther,
) {
  return new Response(null, {
    headers: {
      location,
    },
    status,
  });
}

export function redirectToDeveloperSignIn(url = "/account") {
  return redirect(`/signin?from=${url}`);
}

export function redirectToEmployerSignIn(url = "/employer") {
  return redirect(`/employerSignIn?from=${url}`);
}

export function setRedirectUrlCookie(req: Request, res: Response) {
  const from = new URL(req.url).searchParams.get("from");
  setCookie(res.headers, {
    name: REDIRECT_URL_COOKIE_NAME,
    value: from ?? req.headers.get("referer")!,
    path: "/",
  });
}

export function deleteRedirectUrlCookie(headers: Headers) {
  deleteCookie(headers, REDIRECT_URL_COOKIE_NAME);
}

export function getRedirectUrlCookie(headers: Headers) {
  return getCookies(headers)[REDIRECT_URL_COOKIE_NAME];
}
