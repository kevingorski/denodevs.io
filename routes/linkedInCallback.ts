import defineOAuthCallbackRoute from "@/utils/defineOAuthCallback.ts";
import { linkedInOAuth2Client } from "@/utils/oauth2_clients.ts";
import { OAuthProvider } from "@/types/OAuthProvider.ts";
import { createLinkedInProfile, getLinkedInProfile } from "@/utils/db.ts";
import { getLinkedInUser } from "@/utils/linkedIn.ts";

export default defineOAuthCallbackRoute({
  client: linkedInOAuth2Client,
  createProviderProfile: createLinkedInProfile,
  getProviderProfile: (userData) => getLinkedInProfile(userData.linkedInId),
  getUserData: getLinkedInUser,
  provider: OAuthProvider.LINKED_IN,
});
