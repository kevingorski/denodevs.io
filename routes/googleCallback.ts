import { createGoogleProfile, getGoogleProfile } from "@/utils/db.ts";
import { googleOAuth2Client } from "../utils/oauth2_clients.ts";
import { OAuthProvider } from "@/types/OAuthProvider.ts";
import { getGoogleUser } from "@/utils/google.ts";
import defineOAuthCallbackRoute from "@/utils/defineOAuthCallback.ts";

export default defineOAuthCallbackRoute({
  client: googleOAuth2Client,
  createProviderProfile: createGoogleProfile,
  getProviderProfile: (userData) => getGoogleProfile(userData.googleId),
  getUserData: getGoogleUser,
  provider: OAuthProvider.GOOGLE,
});
