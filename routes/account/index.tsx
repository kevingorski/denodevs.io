import type { Handlers, PageProps, RouteConfig } from "$fresh/server.ts";
import type { AccountState } from "./_middleware.ts";
import { ComponentChild } from "preact";
import { stripe } from "@/utils/payments.ts";
import GitHubAvatarImg from "@/components/GitHubAvatarImg.tsx";
import VerifyEmailButton from "@/islands/VerifyEmailButton.tsx";
import { useCSP } from "$fresh/src/runtime/csp.ts";

export const handler: Handlers<AccountState, AccountState> = {
  GET(_request, ctx) {
    ctx.state.title = "Account";

    return ctx.render(ctx.state);
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

export default function AccountPage(props: PageProps<AccountState>) {
  const { user } = props.data;
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

  return (
    <main>
      <aside>
        <h1>Welcome to your DenoDevs profile!</h1>
        <p>Soon you'll be able to update all of this.</p>
      </aside>
      {!user.emailConfirmed && <VerifyEmailPrompt email={user.email} />}
      <div>
      </div>
      <GitHubAvatarImg login={user.login} size={24} />
      <ul>
        <Row
          title="Username"
          text={user.login}
        />
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
        <Row
          title="Gravatar Id"
          text={user.gravatarId || "N/A"}
        />
      </ul>
      <a href="/signout">
        Sign out
      </a>
    </main>
  );
}

export const config: RouteConfig = {
  csp: true,
};
