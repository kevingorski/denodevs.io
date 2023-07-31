// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import type { AccountState } from "./_middleware.ts";
import { ComponentChild } from "preact";
import { stripe } from "@/utils/payments.ts";

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

export default function AccountPage(props: PageProps<AccountState>) {
  const action = props.data.user.isSubscribed ? "Manage" : "Upgrade";

  return (
    <main>
      <aside>
        <h1>Welcome to your DenoDevs profile!</h1>
        <p>Soon you'll be able to update all of this.</p>
      </aside>
      <img
        src={props.data.user?.avatarUrl}
        alt="User Avatar"
        crossOrigin="anonymous"
      />
      <ul>
        <Row
          title="Username"
          text={props.data.user.login}
        />
        <Row
          title="Email"
          text={props.data.user.email}
        />
        <Row
          title="Subscription"
          text={props.data.user.isSubscribed ? "Premium 🦕" : "Free"}
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
          text={props.data.user.name || "N/A"}
        />
        <Row
          title="Company"
          text={props.data.user.company || "N/A"}
        />
        <Row
          title="Location"
          text={props.data.user.location || "N/A"}
        />
        <Row
          title="Bio"
          text={props.data.user.bio || "N/A"}
        />
        <Row
          title="Gravatar Id"
          text={props.data.user.gravatarId || "N/A"}
        />
      </ul>
      <a href="/signout">
        Sign out
      </a>
    </main>
  );
}
