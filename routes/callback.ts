// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers } from "$fresh/server.ts";
import {
  createUser,
  deleteUserBySession,
  getUser,
  newUserProps,
  updateUser,
  type User,
} from "@/utils/db.ts";
import { stripe } from "@/utils/payments.ts";
import { State } from "./_middleware.ts";
import { handleCallback } from "kv_oauth";
import { oauth2Client } from "@/utils/oauth2_client.ts";
import {
  deleteRedirectUrlCookie,
  getRedirectUrlCookie,
} from "@/utils/redirect.ts";
import { sendEmail } from "@/utils/email.ts";

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

    const githubUser = await getGitHubUser(accessToken);

    const user = await getUser(githubUser.id.toString());
    if (!user) {
      let stripeCustomerId = undefined;
      if (stripe) {
        const customer = await stripe.customers.create({
          email: githubUser.email,
        });
        stripeCustomerId = customer.id;
      }
      const user: User = {
        id: githubUser.id.toString(),
        login: githubUser.login,
        email: githubUser.email,
        name: githubUser.name,
        company: githubUser.company,
        location: githubUser.location,
        bio: githubUser.bio,
        avatarUrl: githubUser.avatar_url,
        gravatarId: githubUser.gravatar_id,
        stripeCustomerId,
        sessionId,
        ...newUserProps(),
      };
      await createUser(user);
      await sendEmail({
        to: user.email,
        subject: "Welcome to DenoDevs",
        html:
          "<h1>Welcome to DenoDevs</h1><p>You're account has been creaated...</p>",
      });
    } else {
      await deleteUserBySession(sessionId);
      await updateUser({ ...user, sessionId });
    }
    return response;
  },
};
