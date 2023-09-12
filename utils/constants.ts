import { assertExists } from "std/testing/asserts.ts";
import { DAY, HOUR, MINUTE } from "std/datetime/constants.ts";

export const SITE_NAME = "Deno Devs";
export const SITE_DESCRIPTION = "Deno developer reverse job board";
export const REDIRECT_PATH_AFTER_LOGIN = "/";
const siteBaseUrl = Deno.env.get("SITE_BASE_URL");
assertExists(siteBaseUrl);
export const SITE_BASE_URL = siteBaseUrl;
export const USE_SECURE_COOKIES =
  Deno.env.get("USE_SECURE_COOKIES") !== "false";
export const CSRF_TOKEN_INPUT_NAME = "csrfToken";

export const CSRF_TOKEN_LIFETIME_MS = 20 * MINUTE;
export const SIGN_IN_TOKEN_LIFETIME_MS = 10 * MINUTE;
export const SESSION_COOKIE_LIFETIME_MS = 7 * DAY;

export const EMPLOYER_SESSION_COOKIE_NAME = "employer-session";

export const ADMIN_SESSION_COOKIE_LIFETIME_MS = 1 * HOUR;
export const ADMIN_SESSION_COOKIE_NAME = "admin-session";

export const SIGN_IN_HELP_COOKIE_LIFETIME_MS = 60 * DAY;
export const SIGN_IN_HELP_COOKIE_NAME = "sign-in-help";

export const CLICKY_SITE_ID = Deno.env.get("CLICKY_SITE_ID");

export const KEVINS_EMAIL_ADDRESS = "kevin@denodevs.io";
export const SUPPORT_EMAIL_ADDRESS = KEVINS_EMAIL_ADDRESS;
