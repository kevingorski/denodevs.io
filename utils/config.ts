import { assertExists } from "std/assert/assert_exists.ts";

const clickySiteId = Deno.env.get("CLICKY_SITE_ID");
const siteBaseUrl = Deno.env.get("SITE_BASE_URL");

assertExists(clickySiteId);
assertExists(siteBaseUrl);

export const CLICKY_SITE_ID = clickySiteId;
export const SITE_BASE_URL = siteBaseUrl;
export const USE_SECURE_COOKIES =
  Deno.env.get("USE_SECURE_COOKIES") !== "false";
