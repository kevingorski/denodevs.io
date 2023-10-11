import { createGitHubOAuth2Client, createGoogleOAuth2Client } from "kv_oauth";
import { SITE_BASE_URL } from "@/utils/config.ts";

export const gitHubOAuth2Client = createGitHubOAuth2Client();

export const googleOAuth2Client = createGoogleOAuth2Client({
  redirectUri: `${SITE_BASE_URL}/googleCallback`,
  defaults: {
    scope: [
      "openid",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  },
});
