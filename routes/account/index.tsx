import type { Handlers, PageProps, RouteConfig } from "$fresh/server.ts";
import type { AccountState } from "./_middleware.ts";
import { ComponentChild } from "preact";
import { GitHub } from "@/components/Icons.tsx";
import GitHubAvatarImg from "@/components/GitHubAvatarImg.tsx";
import VerifyEmailButton from "@/islands/VerifyEmailButton.tsx";
import { useCSP } from "$fresh/src/runtime/csp.ts";
import {
  getGitHubProfileByDeveloper,
  getGoogleProfileByDeveloper,
  GitHubProfile,
  GoogleProfile,
} from "@/utils/db.ts";
import SignOutLink from "@/components/SignOutLink.tsx";
import { UserType } from "@/types/UserType.ts";
import { OAuthProvider } from "@/types/OAuthProvider.ts";
import denoDevsCsp from "@/utils/csp.ts";

interface Props extends AccountState {
  gitHubProfile: GitHubProfile | null;
  googleProfile: GoogleProfile | null;
}

export const handler: Handlers<Props, AccountState> = {
  async GET(_request, ctx) {
    ctx.state.title = "Account";

    const developerId = ctx.state.developer.id;
    const gitHubProfile = await getGitHubProfileByDeveloper(
      developerId,
    );
    const googleProfile = await getGoogleProfileByDeveloper(
      developerId,
    );

    return ctx.render({ ...ctx.state, gitHubProfile, googleProfile });
  },
};

interface RowProps {
  title: string;
  children?: ComponentChild;
  text: string;
}

function Row(props: RowProps) {
  return (
    <div>
      <div style="display:inline-block; margin-right:1em;">
        <strong>{props.title}</strong>
      </div>
      {props.text}
    </div>
  );
}

function VerifyEmailPrompt(props: { email: string }) {
  return (
    <div>
      <VerifyEmailButton email={props.email} />
    </div>
  );
}

export default function AccountPage(props: PageProps<Props>) {
  const { developer, gitHubProfile, googleProfile } = props.data;

  const workTypes: string[] = [];

  if (developer.openToFullTime) workTypes.push("Full-time");
  if (developer.openToPartTime) workTypes.push("Part-time");
  if (developer.openToContract) workTypes.push("Contract");

  const openTo = workTypes.length ? workTypes.join() : "N/A";

  useCSP(denoDevsCsp);

  const gitHubSignInUrl =
    `/account/connectOAuth?provider=${OAuthProvider.GITHUB}`;
  const googleSignInUrl =
    `/account/connectOAuth?provider=${OAuthProvider.GOOGLE}`;

  return (
    <main>
      <h1>Welcome to your DenoDevs profile!</h1>
      <nav>
        <ul>
          <li>
            <a href="#ConnectedAccounts">Connected Accounts</a>
          </li>
          <li>
            <a href="#Email">Email</a>
          </li>
          <li>
            <a href="#ProfileDetails">Profile Details</a>
          </li>
          <li>
            <a href="#JobPreferences">Job Preferences</a>
          </li>
          <li>
            <SignOutLink userType={UserType.Developer} />
          </li>
        </ul>
      </nav>

      <section>
        <h2>
          <a name="ConnectedAccounts">Connected Accounts</a>
        </h2>
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
        <p>More authentication options coming soon.</p>
      </section>

      <section>
        <h2>
          <a name="Email">Email</a>
        </h2>
        <div>{developer.email}</div>
        {!developer.emailConfirmed && (
          <VerifyEmailPrompt email={developer.email} />
        )}
      </section>

      <section>
        <h2>
          <a name="ProfileDetails">Profile Details</a>
        </h2>
        <Row
          title="Name"
          text={developer.name || "N/A"}
        />
        <Row
          title="Location"
          text={developer.location || "N/A"}
        />
        <Row
          title="Bio"
          text={developer.bio || "N/A"}
        />
      </section>

      <section>
        <h2>
          <a name="JobPreferences">Job Preferences</a>
        </h2>
        <Row
          title="Available starting"
          text={developer.availableToWorkStartDate?.toISOString() || "N/A"}
        />
        <Row
          title="Status"
          text={developer.status?.toString() || "N/A"}
        />
        <Row
          title="Open to"
          text={openTo}
        />
      </section>

      <section>
        <h2>Danger Zone</h2>
        <a class="button button--danger" href="/account/delete">
          Delete My Account
        </a>
      </section>
    </main>
  );
}

export const config: RouteConfig = {
  csp: true,
};
