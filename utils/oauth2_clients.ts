import { createGitHubOAuthConfig, createGoogleOAuthConfig } from "kv_oauth";
import { SITE_BASE_URL } from "@/utils/config.ts";

export const gitHubOAuth2Client = createGitHubOAuthConfig();

export const googleOAuth2Client = createGoogleOAuthConfig({
  redirectUri: `${SITE_BASE_URL}/googleCallback`,
  scope: [
    "openid",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ],
});
