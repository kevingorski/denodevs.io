import { OAuthProvider } from "@/types/OAuthProvider.ts";

export default interface SignInHelp {
  developerOAuthProviders?: OAuthProvider[];
  developerMaskedEmail?: string;
  employerMaskedEmail?: string;
}
