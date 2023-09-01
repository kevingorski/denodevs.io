import type { Handlers } from "$fresh/server.ts";
import { signIn } from "kv_oauth";
import { gitHubOAuth2Client } from "@/utils/oauth2_client.ts";
import { AccountState } from "@/routes/account/_middleware.ts";
import { OAuthProvider } from "@/types/OAuthProvider.ts";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, AccountState> = {
  async GET(req, ctx) {
    const requestUrl = new URL(req.url);
    const provider = requestUrl.searchParams.get("provider");
    let client;
    let options = {};

    switch (provider) {
      case OAuthProvider.GITHUB:
        client = gitHubOAuth2Client;
        options = {
          urlParams: {
            redirect_uri: new URL(req.url).origin + "/gitHubCallback",
          },
        };
        break;
      default:
        return ctx.renderNotFound();
    }

    return await signIn(req, client, options);
  },
};
