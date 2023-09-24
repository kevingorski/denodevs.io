import { addOAuthProviderToResponse } from "@/utils/signInHelp.ts";
import { OAuthProvider } from "@/types/OAuthProvider.ts";
import { upgradeDeveloperOAuthSession } from "@/utils/db.ts";
import { getDeveloperOrNullFromSessionId } from "@/utils/getDeveloperFromSessionId.ts";
import { handleCallback } from "kv_oauth/mod.ts";
import { OAuth2Client } from "kv_oauth/deps.ts";
import { defineRoute } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import { redirectToDeveloperSignUp } from "@/utils/redirect.ts";

interface UserProfile {
  developerId: string;
}

interface OAuth2ProviderOptions<TUserData> {
  client: OAuth2Client;
  createProviderProfile: (userProfile: TUserData & UserProfile) => void;
  getProviderProfile: (
    userData: TUserData,
  ) => Promise<TUserData & UserProfile | null>;
  getUserData: (accessToken: string) => Promise<TUserData>;
  provider: OAuthProvider;
}

export default function buildOAuthCallback<
  TUserData,
>(
  options: OAuth2ProviderOptions<TUserData>,
) {
  const {
    client,
    createProviderProfile,
    getProviderProfile,
    getUserData,
    provider,
  } = options;
  return defineRoute<State>(async (req, ctx) => {
    const developer = await getDeveloperOrNullFromSessionId(
      ctx.state.sessionId,
    );
    const { response, accessToken, sessionId } = await handleCallback(
      req,
      client,
    );
    const userData = await getUserData(accessToken);

    if (!userData) {
      // NB: lookup failed, this might need to be handled differently
      return redirectToDeveloperSignUp();
    }

    // Already authenticated, associate with developer
    if (developer !== null) {
      createProviderProfile({
        ...userData,
        developerId: developer.id,
      });

      return await upgradeSessionAndResponse(
        provider,
        developer.id,
        sessionId,
        req,
        response,
      );
    }

    const providerProfile = await getProviderProfile(userData);
    if (!providerProfile) {
      // Maybe grab email and pre-populate?
      return redirectToDeveloperSignUp();
    }

    return await upgradeSessionAndResponse(
      provider,
      providerProfile.developerId,
      sessionId,
      req,
      response,
    );
  });
}

async function upgradeSessionAndResponse(
  provider: OAuthProvider,
  developerId: string,
  sessionId: string,
  req: Request,
  response: Response,
) {
  await upgradeDeveloperOAuthSession(developerId, sessionId);

  addOAuthProviderToResponse(
    req,
    response,
    provider,
  );

  return response;
}
