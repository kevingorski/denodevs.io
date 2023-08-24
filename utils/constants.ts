import { DAY, MINUTE } from "std/datetime/constants.ts";

export const SITE_NAME = "Deno Devs";
export const SITE_DESCRIPTION = "Deno developer reverse job board";
export const REDIRECT_PATH_AFTER_LOGIN = "/";
export const SITE_BASE_URL = Deno.env.get("SITE_BASE_URL");

export const LOGIN_TOKEN_LIFETIME_MS = 10 * MINUTE;

export const EMPLOYER_SESSION_COOKIE_LIFETIME_MS = 7 * DAY;
export const EMPLOYER_SESSION_COOKIE_LIFETIME_SECONDS =
  EMPLOYER_SESSION_COOKIE_LIFETIME_MS / 1000;
export const EMPLOYER_SESSION_COOKIE_NAME = "employer-session";
