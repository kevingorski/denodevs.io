import type { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import { GitHub } from "@/components/Icons.tsx";

export const handler: Handlers<State, State> = {
  GET(_, ctx) {
    return ctx.render(ctx.state);
  },
};

export default function DeveloperPage() {
  return (
    <main>
      <h1>
        Hello developer!
      </h1>

      <p>
        To start creating your profile, first login with your GitHub account.
        The details of your GitHub account will be used to create your profile,
        but you can edit it and connect other accounts to it afterward.
      </p>

      <p>
        Your email address will be used to confirm your identity and send you
        updates about job matches and DenoDevs updates. If the email address on
        your GitHub account is not the one you'd like to use, it can be updated
        after the initial setup.
      </p>

      <p>
        In the future, you'll be able to showcase work on GitHub through this
        integration.
      </p>

      <div>
        <a class="button" href="/account">
          <GitHub /> Login with GitHub
        </a>
      </div>

      <p>More authentication options coming soon.</p>

      <div>TK: Remind me later</div>

      <h2>
        <a href="/">Home</a>
      </h2>
    </main>
  );
}
