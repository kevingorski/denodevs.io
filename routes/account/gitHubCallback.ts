import type { Handlers } from "$fresh/server.ts";
import {
  createGitHubProfile,
  getGitHubProfile,
  upgradeDeveloperOAuthSession,
} from "@/utils/db.ts";
import { AccountState } from "./_middleware.ts";
import { handleCallback } from "kv_oauth";
import { gitHubOAuth2Client } from "@/utils/oauth2_clients.ts";
import { getGitHubUser } from "@/utils/github.ts";
import { OAuthProvider } from "@/types/OAuthProvider.ts";
import { addOAuthProviderToResponse } from "@/utils/signInHelp.ts";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, AccountState> = {
  async GET(req, ctx) {
    const { developer } = ctx.state;
    const { response, accessToken, sessionId } = await handleCallback(
      req,
      gitHubOAuth2Client,
    );

    const gitHubUser = await getGitHubUser(accessToken);
    const gitHubProfile = await getGitHubProfile(gitHubUser.id);
    if (!gitHubProfile) {
      await createGitHubProfile({
        developerId: developer.id,
        gitHubId: gitHubUser.id,
        email: gitHubUser.email,
        login: gitHubUser.login,
        avatarUrl: gitHubUser.avatar_url,
        gravatarId: gitHubUser.gravatar_id,
        name: gitHubUser.name,
        company: gitHubUser.company,
        location: gitHubUser.location,
        bio: gitHubUser.bio,
      });
    }
    await upgradeDeveloperOAuthSession(developer.id, sessionId);
    addOAuthProviderToResponse(
      req,
      response,
      OAuthProvider.GITHUB,
    );
    return response;
  },
};
