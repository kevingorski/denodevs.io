import type { Handlers } from "$fresh/server.ts";
import { getGitHubProfile, upgradeUserOAuthSession } from "@/utils/db.ts";
import { handleCallback } from "kv_oauth";
import { gitHubOAuth2Client } from "@/utils/oauth2_client.ts";
import { State } from "@/routes/_middleware.ts";
import { getGitHubUser } from "@/utils/github.ts";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
  async GET(req, ctx) {
    const { response, accessToken, sessionId } = await handleCallback(
      req,
      gitHubOAuth2Client,
    );

    const gitHubUser = await getGitHubUser(accessToken);
    const gitHubProfile = await getGitHubProfile(gitHubUser.id);
    if (!gitHubProfile) {
      // TODO: show a message about signing up
      return ctx.renderNotFound();
    }
    await upgradeUserOAuthSession(gitHubProfile.userId, sessionId);
    return response;
  },
};
