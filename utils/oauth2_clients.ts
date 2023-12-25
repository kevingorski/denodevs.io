import {
  createGitHubOAuthConfig,
  createGoogleOAuthConfig,
  getRequiredEnv,
  OAuth2ClientConfig,
} from "kv_oauth";
import { SITE_BASE_URL } from "@/utils/config.ts";
import { OAuthProvider } from "@/types/OAuthProvider.ts";

export const gitHubOAuth2Client = createGitHubOAuthConfig();

export const googleOAuth2Client = createGoogleOAuthConfig({
  redirectUri: `${SITE_BASE_URL}/googleCallback`,
  scope: [
    "openid",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ],
});

export const linkedInOAuth2Client: OAuth2ClientConfig = {
  authorizationEndpointUri: "https://www.linkedin.com/oauth/v2/authorization",
  clientId: getRequiredEnv("LINKED_IN_CLIENT_ID"),
  clientSecret: getRequiredEnv("LINKED_IN_CLIENT_SECRET"),
  redirectUri: `${SITE_BASE_URL}/linkedInCallback`,
  tokenUri: "https://www.linkedin.com/oauth/v2/accessToken",
  defaults: {
    requestOptions: {
      body: {
        client_id: getRequiredEnv("LINKED_IN_CLIENT_ID"),
        client_secret: getRequiredEnv("LINKED_IN_CLIENT_SECRET"),
      },
    },
    scope: [
      "email",
      "openid",
      "profile",
    ],
  },
};

export function getClientByOAuthProvider(provider: OAuthProvider) {
  switch (provider) {
    case OAuthProvider.GITHUB:
      return gitHubOAuth2Client;
    case OAuthProvider.GOOGLE:
      return googleOAuth2Client;
    case OAuthProvider.LINKED_IN:
      return linkedInOAuth2Client;
  }
}
