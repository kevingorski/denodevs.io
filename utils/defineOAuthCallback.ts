import { addOAuthProviderToResponse } from "@/utils/signInHelp.ts";
import { OAuthProvider } from "@/types/OAuthProvider.ts";
import { getDeveloperOrNullFromSessionId } from "@/utils/getDeveloperFromSessionId.ts";
import { handleCallback, OAuth2ClientConfig } from "kv_oauth/mod.ts";
import { defineRoute } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import { redirectToDeveloperSignIn } from "@/utils/redirect.ts";
import {
  createDeveloper,
  createDeveloperSession,
  newDeveloperProps,
} from "@/utils/db.ts";

interface UserProfile {
  developerId: string;
}

interface OAuth2ProviderOptions<TUserData> {
  client: OAuth2ClientConfig;
  createProviderProfile: (userProfile: TUserData & UserProfile) => void;
  getProviderProfile: (
    userData: TUserData,
  ) => Promise<TUserData & UserProfile | null>;
  getUserData: (accessToken: string) => Promise<TUserData>;
  provider: OAuthProvider;
}

export default function defineOAuthCallbackRoute<
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
    const { response, sessionId, tokens: { accessToken } } =
      await handleCallback(
        req,
        client,
      );
    const userData = await getUserData(accessToken);

    if (!userData) {
      console.error(`Failed to get user data with access token ${accessToken}`);
      // NB: lookup failed, this might need to be handled differently
      return redirectToDeveloperSignIn();
    }

    const providerProfile = await getProviderProfile(userData);

    // Profile exists and dev is authenticated -> no-op
    // Profile exists and dev is not authenticated -> sign in as that dev
    // Profile does not exist and dev is authenticated -> create new profile
    // Profile does not exist and dev is not authenticated -> create new dev and profile

    if (providerProfile) {
      return await handleOAuthSuccess(
        sessionId,
        developer !== null ? developer.id : providerProfile.developerId,
        req,
        response,
        provider,
      );
    }

    let developerId;
    if (developer !== null) {
      developerId = developer.id;
    } else {
      const newDeveloper = await createDeveloper(newDeveloperProps());
      developerId = newDeveloper.id;
    }

    createProviderProfile({
      ...userData,
      developerId,
    });

    return await handleOAuthSuccess(
      sessionId,
      developerId,
      req,
      response,
      provider,
    );
  });
}

async function handleOAuthSuccess(
  sessionId: string,
  developerId: string,
  req: Request,
  response: Response,
  provider: OAuthProvider,
) {
  await createDeveloperSession(sessionId, developerId);

  addOAuthProviderToResponse(
    req,
    response,
    provider,
  );

  return response;
}
