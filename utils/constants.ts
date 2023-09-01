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

export const LOGIN_TOKEN_LIFETIME_MS = 10 * MINUTE;

export const EMPLOYER_SESSION_COOKIE_LIFETIME_MS = 7 * DAY;
export const EMPLOYER_SESSION_COOKIE_LIFETIME_SECONDS =
  EMPLOYER_SESSION_COOKIE_LIFETIME_MS / 1000;
export const EMPLOYER_SESSION_COOKIE_NAME = "employer-session";

export const ADMIN_SESSION_COOKIE_LIFETIME_MS = 1 * HOUR;
export const ADMIN_SESSION_COOKIE_NAME = "admin-session";
