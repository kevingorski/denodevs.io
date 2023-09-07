import type { Handlers } from "$fresh/server.ts";
import { getGitHubProfile, upgradeDeveloperOAuthSession } from "@/utils/db.ts";
import { handleCallback } from "kv_oauth";
import { gitHubOAuth2Client } from "@/utils/oauth2_client.ts";
import { State } from "@/routes/_middleware.ts";
import { getGitHubUser } from "@/utils/github.ts";
import { OAuthProvider } from "@/types/OAuthProvider.ts";
import { addOAuthProviderToResponse } from "@/utils/signInHelp.ts";
import { redirectToDeveloperSignUp } from "@/utils/redirect.ts";

export const handler: Handlers<State, State> = {
  async GET(req, _ctx) {
    const { response, accessToken, sessionId } = await handleCallback(
      req,
      gitHubOAuth2Client,
    );

    const gitHubUser = await getGitHubUser(accessToken);
    const gitHubProfile = await getGitHubProfile(gitHubUser.id);
    if (!gitHubProfile) {
      return redirectToDeveloperSignUp();
    }
    await upgradeDeveloperOAuthSession(gitHubProfile.developerId, sessionId);

    addOAuthProviderToResponse(
      req,
      response,
      OAuthProvider.GITHUB,
    );

    return response;
  },
};
