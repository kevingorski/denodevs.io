
export const SITE_NAME = "Deno Devs";
export const SITE_DESCRIPTION = "Deno developer reverse job board";
export const REDIRECT_PATH_AFTER_LOGIN = "/";
export const SITE_BASE_URL = Deno.env.get("SITE_BASE_URL");

export const EMPLOYER_SESSION_COOKIE_LIFETIME = 604800; // 1 week
export const EMPLOYER_SESSION_COOKIE_NAME = "employer-session";
