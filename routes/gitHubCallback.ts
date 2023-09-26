import { createGitHubProfile, getGitHubProfile } from "@/utils/db.ts";
import { gitHubOAuth2Client } from "@/utils/oauth2_clients.ts";
import { getGitHubUser } from "@/utils/github.ts";
import { OAuthProvider } from "@/types/OAuthProvider.ts";
import defineOAuthCallbackRoute from "@/utils/buildOAuthCallback.ts";

export default defineOAuthCallbackRoute({
  client: gitHubOAuth2Client,
  createProviderProfile: createGitHubProfile,
  getProviderProfile: (userData) => getGitHubProfile(userData.gitHubId),
  getUserData: getGitHubUser,
  provider: OAuthProvider.GITHUB,
});
