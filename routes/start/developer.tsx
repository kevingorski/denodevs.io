
import type { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";

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

      <div>
        TK: <a href="/account">GitHub Login Button</a>
      </div>

      <p>More authentication options coming soon.</p>

      <div>TK: Remind me later</div>

      <h2>
        <a href="/">Home</a>
      </h2>
    </main>
  );
}
