import type { Handlers } from "$fresh/server.ts";
import {
  createGitHubProfile,
  getGitHubProfile,
  upgradeUserOAuthSession,
} from "@/utils/db.ts";
import { AccountState } from "./_middleware.ts";
import { handleCallback } from "kv_oauth";
import { gitHubOAuth2Client } from "@/utils/oauth2_client.ts";

interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  gravatar_id: string | null;
  name: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  email: string | null;
}

async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error();
  }
  return await response.json() as GitHubUser;
}

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, AccountState> = {
  async GET(req, ctx) {
    const { user } = ctx.state;
    const { response, accessToken, sessionId } = await handleCallback(
      req,
      gitHubOAuth2Client,
    );

    const gitHubUser = await getGitHubUser(accessToken);
    const gitHubProfile = await getGitHubProfile(gitHubUser.id);
    if (!gitHubProfile) {
      await createGitHubProfile({
        userId: user.id,
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
    await upgradeUserOAuthSession(user.id, sessionId);
    return response;
  },
};
