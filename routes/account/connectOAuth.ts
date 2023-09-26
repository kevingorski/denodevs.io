import { defineRoute } from "$fresh/server.ts";
import { signIn } from "kv_oauth";
import {
  gitHubOAuth2Client,
  googleOAuth2Client,
} from "../../utils/oauth2_clients.ts";
import { OAuthProvider } from "@/types/OAuthProvider.ts";

export default defineRoute(
  async (req, ctx) => {
    const requestUrl = new URL(req.url);
    const provider = requestUrl.searchParams.get("provider");
    let client;
    switch (provider) {
      case OAuthProvider.GITHUB:
        client = gitHubOAuth2Client;
        break;
      case OAuthProvider.GOOGLE:
        client = googleOAuth2Client;
        break;
      default:
        return ctx.renderNotFound();
    }
    return await signIn(req, client);
  },
);
