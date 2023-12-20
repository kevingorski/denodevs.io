import { defineRoute } from "$fresh/server.ts";
import { signIn } from "kv_oauth";
import { getClientByOAuthProvider } from "../utils/oauth2_clients.ts";
import { OAuthProvider } from "@/types/OAuthProvider.ts";

export default defineRoute(
  async (req, ctx) => {
    const requestUrl = new URL(req.url);
    const provider = requestUrl.searchParams.get("provider");
    if (!provider) {
      return ctx.renderNotFound();
    }
    const client = getClientByOAuthProvider(provider as OAuthProvider);

    return await signIn(req, client);
  },
);
