import type { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import { UserType } from "@/types/UserType.ts";
import SignUpSupportLink from "@/components/SignUpSupportLink.tsx";

export const handler: Handlers<State, State> = {
  GET(_, ctx) {
    return ctx.render(ctx.state);
  },
};

export default function DeveloperThanksPage() {
  return (
    <main>
      <h1>
        Thanks For Signing Up!
      </h1>

      <p>
        You should receive a confirmation email from DenoDevs shortly, which
        will let you get started.
      </p>

      <ul>
        <li>
          <SignUpSupportLink
            userType={UserType.Developer}
          />
        </li>
        <li>
          <a href="/">Home</a>
        </li>
      </ul>
    </main>
  );
}
