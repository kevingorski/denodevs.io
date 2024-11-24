import { DAY, MINUTE } from "std/datetime/constants.ts";

export const SITE_NAME = "Deno Devs";
export const SITE_DESCRIPTION =
  `${SITE_NAME} is where employers apply to Deno developers`;
export const SITE_VERSION = "Alpha";

export const REDIRECT_PATH_AFTER_LOGIN = "/";
export const CSRF_TOKEN_INPUT_NAME = "csrfToken";
export const CSRF_TOKEN_LIFETIME_MS = 20 * MINUTE;
export const SIGN_IN_TOKEN_LIFETIME_MS = 10 * MINUTE;
export const SESSION_COOKIE_LIFETIME_MS = 7 * DAY;

export const EMPLOYER_SESSION_COOKIE_NAME = "employer-session";

export const SIGN_IN_HELP_COOKIE_LIFETIME_MS = 60 * DAY;
export const SIGN_IN_HELP_COOKIE_NAME = "sign-in-help";

export const KEVINS_EMAIL_ADDRESS = "kevin@denodevs.com";
export const SUPPORT_EMAIL_ADDRESS = KEVINS_EMAIL_ADDRESS;
