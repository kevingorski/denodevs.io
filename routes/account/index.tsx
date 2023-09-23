import type { Handlers, PageProps, RouteConfig } from "$fresh/server.ts";
import type { AccountState } from "./_middleware.ts";
import { ComponentChild } from "preact";
import { stripe } from "@/utils/payments.ts";
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
    <li>
      <div>
        <span>
          <strong>{props.title}</strong>
        </span>
        {props.children && <span>{props.children}</span>}
      </div>
      <p>
        {props.text}
      </p>
    </li>
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
  const action = developer.isSubscribed ? "Manage" : "Upgrade";

  useCSP(denoDevsCsp);

  const gitHubSignInUrl =
    `/account/connectOAuth?provider=${OAuthProvider.GITHUB}`;
  const googleSignInUrl =
    `/account/connectOAuth?provider=${OAuthProvider.GOOGLE}`;

  return (
    <main>
      <aside>
        <h1>Welcome to your DenoDevs profile!</h1>
        <p>Soon you'll be able to update all of this.</p>
      </aside>
      {!developer.emailConfirmed && (
        <VerifyEmailPrompt email={developer.email} />
      )}
      <div>
      </div>

      {!gitHubProfile && (
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
      {gitHubProfile && (
        <GitHubAvatarImg login={gitHubProfile.login} size={24} />
      )}
      <ul>
        <Row
          title="Email"
          text={developer.email}
        />
        <Row
          title="Subscription"
          text={developer.isSubscribed ? "Premium 🦕" : "Free"}
        >
          {stripe && (
            <a
              class="underline"
              href={`/account/${action.toLowerCase()}`}
            >
              {action}
            </a>
          )}
        </Row>
        <Row
          title="Name"
          text={developer.name || "N/A"}
        />
        <Row
          title="Company"
          text={developer.company || "N/A"}
        />
        <Row
          title="Location"
          text={developer.location || "N/A"}
        />
        <Row
          title="Bio"
          text={developer.bio || "N/A"}
        />
      </ul>
      <SignOutLink userType={UserType.Developer} />
      <h2>Danger Zone</h2>
      <a class="button button--danger" href="/account/delete">
        Delete My Account
      </a>
    </main>
  );
}

export const config: RouteConfig = {
  csp: true,
};
