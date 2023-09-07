import { getCookies, setCookie } from "std/http/cookie.ts";
import {
  SIGN_IN_HELP_COOKIE_LIFETIME_MS,
  SIGN_IN_HELP_COOKIE_NAME,
  USE_SECURE_COOKIES,
} from "@/utils/constants.ts";
import SignInHelp from "@/types/SignInHelp.ts";
import { OAuthProvider } from "@/types/OAuthProvider.ts";

export function setSignInHelpCookie(
  response: Response,
  signInHelp: SignInHelp,
) {
  const json = JSON.stringify(signInHelp);
  const encodedJson = encodeURIComponent(json);
  setCookie(
    response.headers,
    {
      path: "/",
      httpOnly: true,
      secure: USE_SECURE_COOKIES,
      maxAge: SIGN_IN_HELP_COOKIE_LIFETIME_MS,
      sameSite: "Strict",
      name: SIGN_IN_HELP_COOKIE_NAME,
      value: encodedJson,
    },
  );
}

export function getSignInHelpFromCookie(request: Request): SignInHelp | null {
  const signInHelpCookie =
    getCookies(request.headers)[SIGN_IN_HELP_COOKIE_NAME];
  return signInHelpCookie
    ? JSON.parse(decodeURIComponent(signInHelpCookie))
    : null;
}

export function maskEmail(email: string): string {
  return email.replace(/^(.)(.*)(.@.*)$/, "$1***$3");
}

function addToResponse<TParam>(
  req: Request,
  res: Response,
  add: (l: SignInHelp, p: TParam) => SignInHelp,
  param: TParam,
) {
  // Great place for a pipeline operator
  const signInHelp = getSignInHelpFromCookie(req) ?? {};
  const updatedSignInHelp = add(signInHelp, param);
  setSignInHelpCookie(
    res,
    updatedSignInHelp,
  );
}

export function addDeveloperEmail(
  signInHelp: SignInHelp,
  email: string,
): SignInHelp {
  return {
    ...signInHelp,
    developerMaskedEmail: maskEmail(email),
  };
}

export function addDeveloperEmailToResponse(
  req: Request,
  res: Response,
  email: string,
) {
  addToResponse(req, res, addDeveloperEmail, email);
}

export function addOAuthProvider(
  signInHelp: SignInHelp,
  oauthProvider: OAuthProvider,
) {
  return {
    ...signInHelp,
    developerOAuthProviders: [
      ...(signInHelp.developerOAuthProviders || []),
      oauthProvider,
    ],
  };
}

export function addOAuthProviderToResponse(
  req: Request,
  res: Response,
  oauthProvider: OAuthProvider,
) {
  addToResponse(req, res, addOAuthProvider, oauthProvider);
}

export function addEmployerEmail(
  signInHelp: SignInHelp,
  email: string,
): SignInHelp {
  return {
    ...signInHelp,
    employerMaskedEmail: maskEmail(email),
  };
}

export function addEmployerEmailToResponse(
  req: Request,
  res: Response,
  email: string,
) {
  addToResponse(req, res, addEmployerEmail, email);
}
