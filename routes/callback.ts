import type { Handlers } from "$fresh/server.ts";
import {
  createGitHubProfile,
  createUser,
  createUserLoginToken,
  createUserSession,
  getGitHubProfile,
  newUserProps,
} from "@/utils/db.ts";
import { stripe } from "@/utils/payments.ts";
import { State } from "./_middleware.ts";
import { handleCallback } from "kv_oauth";
import { oauth2Client } from "@/utils/oauth2_client.ts";
import {
  deleteRedirectUrlCookie,
  getRedirectUrlCookie,
} from "@/utils/redirect.ts";
import { sendWelcomeDevEmailMessage } from "@/utils/email.ts";

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
  email: string;
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
export const handler: Handlers<any, State> = {
  async GET(req) {
    const { response, accessToken, sessionId } = await handleCallback(
      req,
      oauth2Client,
      getRedirectUrlCookie(req.headers),
    );

    deleteRedirectUrlCookie(response.headers);

    const gitHubUser = await getGitHubUser(accessToken);
    const gitHubProfile = await getGitHubProfile(gitHubUser.id);
    if (!gitHubProfile) {
      let stripeCustomerId = undefined;
      if (stripe) {
        const customer = await stripe.customers.create({
          email: gitHubUser.email,
        });
        stripeCustomerId = customer.id;
      }
      const user = {
        email: gitHubUser.email,
        login: gitHubUser.login,
        name: gitHubUser.name,
        company: gitHubUser.company,
        location: gitHubUser.location,
        bio: gitHubUser.bio,
        avatarUrl: gitHubUser.avatar_url,
        gravatarId: gitHubUser.gravatar_id,
        stripeCustomerId,
        ...newUserProps(),
      };
      await createUser(user);
      const [token, _] = await Promise.all([
        createUserLoginToken(user),
        createGitHubProfile({
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
        }),
      ]);
      await Promise.all([
        sendWelcomeDevEmailMessage(user, token.uuid),
        createUserSession(user.id, sessionId),
      ]);
    } else {
      await createUserSession(gitHubProfile.userId, sessionId);
    }
    return response;
  },
};
