import type { Handlers } from "$fresh/server.ts";
import {
  createGoogleProfile,
  getGoogleProfile,
  GoogleProfile,
  upgradeDeveloperOAuthSession,
} from "@/utils/db.ts";
import { handleCallback } from "kv_oauth";
import { googleOAuth2Client } from "../utils/oauth2_clients.ts";
import { State } from "@/routes/_middleware.ts";
import { OAuthProvider } from "@/types/OAuthProvider.ts";
import { addOAuthProviderToResponse } from "@/utils/signInHelp.ts";
import { redirectToDeveloperSignUp } from "@/utils/redirect.ts";
import { getDeveloperOrNullFromSessionId } from "@/utils/getDeveloperFromSessionId.ts";
import { getGoogleUserId } from "@/utils/google.ts";

export const handler: Handlers<State, State> = {
  async GET(req, ctx) {
    const developer = await getDeveloperOrNullFromSessionId(
      ctx.state.sessionId,
    );
    const { response, accessToken, sessionId } = await handleCallback(
      req,
      googleOAuth2Client,
    );
    const googleUserId = await getGoogleUserId(accessToken);

    if (!googleUserId) {
      // NB: lookup failed, this might need to be handled differently
      return redirectToDeveloperSignUp();
    }

    // TODO: consider refactoring GitHub flow to use this

    // Alraedy authenticated, associate with developer
    if (developer !== null) {
      const googleProfile = {
        googleId: googleUserId,
        developerId: developer.id,
      };
      createGoogleProfile(googleProfile);

      return await upgradeSessionAndResponse(
        googleProfile,
        sessionId,
        req,
        response,
      );
    }

    const googleProfile = await getGoogleProfile(googleUserId);
    if (!googleProfile) {
      // Maybe grab email and pre-populate?
      return redirectToDeveloperSignUp();
    }

    return await upgradeSessionAndResponse(
      googleProfile,
      sessionId,
      req,
      response,
    );
  },
};

async function upgradeSessionAndResponse(
  googleProfile: GoogleProfile,
  sessionId: string,
  req: Request,
  response: Response,
) {
  await upgradeDeveloperOAuthSession(googleProfile.developerId, sessionId);

  addOAuthProviderToResponse(
    req,
    response,
    OAuthProvider.GOOGLE,
  );

  return response;
}
