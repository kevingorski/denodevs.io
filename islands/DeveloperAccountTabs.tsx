import * as Tabs from "@radix-ui/react-tabs";
import { GitHubProfile, GoogleProfile, LinkedInProfile } from "@/utils/db.ts";
import { Developer } from "@/types/Developer.ts";
import { OAuthProvider } from "@/types/OAuthProvider.ts";
import GitHubAvatarImg from "@/components/GitHubAvatarImg.tsx";
import DeveloperProfileDetails from "@/islands/DeveloperProfileDetails.tsx";
import { ProtectedForm } from "@/utils/csrf.ts";
import { GitHub } from "@/components/Icons.tsx";
import DeveloperEmailDetails from "@/islands/DeveloperEmailDetails.tsx";

enum TabsValue {
  Profile = "Profile",
  Email = "Email",
  ConnectedAccounts = "ConnectedAccounts",
  DangerZone = "DangerZone",
}

interface Props extends ProtectedForm {
  developer: Developer;
  gitHubProfile: GitHubProfile | null;
  googleProfile: GoogleProfile | null;
  linkedInProfile: LinkedInProfile | null;
}

export default function DeveloperAccountTabs(
  { csrfToken, developer, gitHubProfile, googleProfile, linkedInProfile }:
    Props,
) {
  const gitHubSignInUrl =
    `/account/connectOAuth?provider=${OAuthProvider.GITHUB}`;
  const googleSignInUrl =
    `/account/connectOAuth?provider=${OAuthProvider.GOOGLE}`;
  const linkedInSignInUrl =
    `/account/connectOAuth?provider=${OAuthProvider.LINKED_IN}`;

  const developerHasVerifiedEmail = developer.email && developer.emailConfirmed;

  return (
    <Tabs.Root
      className="TabsRoot"
      defaultValue={TabsValue.Email}
    >
      <Tabs.List className="TabsList">
        <Tabs.Trigger className="TabsTrigger" value={TabsValue.Email}>
          Email
        </Tabs.Trigger>
        <Tabs.Trigger
          className="TabsTrigger"
          disabled={!developerHasVerifiedEmail}
          value={TabsValue.Profile}
        >
          Profile
        </Tabs.Trigger>
        <Tabs.Trigger
          className="TabsTrigger"
          disabled={!developerHasVerifiedEmail}
          value={TabsValue.ConnectedAccounts}
        >
          Connected Accounts
        </Tabs.Trigger>
        <Tabs.Trigger className="TabsTrigger" value={TabsValue.DangerZone}>
          Danger Zone
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content className="TabsContent" value={TabsValue.Profile}>
        <DeveloperProfileDetails csrfToken={csrfToken} developer={developer} />
      </Tabs.Content>
      <Tabs.Content className="TabsContent" value={TabsValue.Email}>
        <DeveloperEmailDetails developer={developer} />
      </Tabs.Content>
      <Tabs.Content className="TabsContent" value={TabsValue.ConnectedAccounts}>
        <p>
          These are used for signing in without a password or magic email.
        </p>
        {gitHubProfile
          ? <GitHubAvatarImg login={gitHubProfile.login} size={24} />
          : (
            <div>
              <a class="button" href={gitHubSignInUrl}>
                <GitHub /> Connect with GitHub
              </a>
            </div>
          )}
        {!googleProfile && (
          <div>
            <a class="button" href={googleSignInUrl}>
              G Connect with Google
            </a>
          </div>
        )}
        {!linkedInProfile && (
          <div>
            <a class="button" href={linkedInSignInUrl}>
              Sign in with LinkedIn
            </a>
          </div>
        )}
        <p>More authentication options coming soon.</p>
      </Tabs.Content>
      <Tabs.Content className="TabsContent" value={TabsValue.DangerZone}>
        <a class="button button--danger" href="/account/delete">
          Delete My Account
        </a>
      </Tabs.Content>
    </Tabs.Root>
  );
}
