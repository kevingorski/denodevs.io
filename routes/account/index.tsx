import type { Handlers, PageProps, RouteConfig } from "$fresh/server.ts";
import type { AccountState } from "./_middleware.ts";
import { ComponentChild } from "preact";
import { stripe } from "@/utils/payments.ts";
import { GitHub } from "@/components/Icons.tsx";
import GitHubAvatarImg from "@/components/GitHubAvatarImg.tsx";
import VerifyEmailButton from "@/islands/VerifyEmailButton.tsx";
import { useCSP } from "$fresh/src/runtime/csp.ts";
import {
  getGitHubProfile,
  getGitHubProfileByUser,
  GitHubProfile,
} from "@/utils/db.ts";
import { OAuthProvider } from "@/routes/account/connectOAuth.ts";
import SignOutLink from "@/components/SignOutLink.tsx";
import { UserType } from "@/types/UserType.ts";

interface Props extends AccountState {
  gitHubProfile: GitHubProfile | null;
}

export const handler: Handlers<Props, AccountState> = {
  async GET(_request, ctx) {
    ctx.state.title = "Account";

    const gitHubProfile = await getGitHubProfileByUser(ctx.state.user.id);

    return ctx.render({ ...ctx.state, gitHubProfile });
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
  const { user, gitHubProfile } = props.data;
  const action = user.isSubscribed ? "Manage" : "Upgrade";

  // TODO: refactor this to something reusable when it drops
  // https://github.com/denoland/fresh/issues/1705
  useCSP((csp) => {
    csp.directives.baseUri = ["'none'"];
    if (!csp.directives.scriptSrc) {
      csp.directives.scriptSrc = [];
    }
    csp.directives.scriptSrc.push("'strict-dynamic'");
    csp.directives.scriptSrc.push("'unsafe-inline'");
    csp.directives.scriptSrc.push("http:");
    csp.directives.scriptSrc.push("https:");
    if (!csp.directives.styleSrc) {
      csp.directives.styleSrc = [];
    }
    csp.directives.styleSrc.push("'self'");
    if (!csp.directives.imgSrc) {
      csp.directives.imgSrc = [];
    }
    csp.directives.imgSrc.push("'self'");
    csp.directives.imgSrc.push("avatars.githubusercontent.com");
  });

  const gitHubSignInUrl =
    `/account/connectOAuth?provider=${OAuthProvider.GITHUB}&`;

  return (
    <main>
      <aside>
        <h1>Welcome to your DenoDevs profile!</h1>
        <p>Soon you'll be able to update all of this.</p>
      </aside>
      {!user.emailConfirmed && <VerifyEmailPrompt email={user.email} />}
      <div>
      </div>

      {/* TODO: show GH already connected */}
      {!gitHubProfile && (
        <div>
          <a class="button" href={gitHubSignInUrl}>
            <GitHub /> Connect with GitHub
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
          text={user.email}
        />
        <Row
          title="Subscription"
          text={user.isSubscribed ? "Premium 🦕" : "Free"}
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
          text={user.name || "N/A"}
        />
        <Row
          title="Company"
          text={user.company || "N/A"}
        />
        <Row
          title="Location"
          text={user.location || "N/A"}
        />
        <Row
          title="Bio"
          text={user.bio || "N/A"}
        />
      </ul>
      <SignOutLink userType={UserType.Developer} />
    </main>
  );
}

export const config: RouteConfig = {
  csp: true,
};
