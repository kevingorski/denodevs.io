
import type { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";

export const handler: Handlers<State, State> = {
  GET(_, ctx) {
    return ctx.render(ctx.state);
  },
};

export default function AboutPage() {
  return (
    <main>
      <h1>
        More about DenoDevs – the reverse job board for Deno developers
      </h1>

      <h2>
        DenoDevs helps developers find their next job or contract working with
        Deno.
      </h2>
      <p>
        The Deno developer community is growing, but it's still rare to find
        relevant jobs and contracts. Stop searching for a needle in a haystack,
        let DenoDevs help!
      </p>
      <ol>
        <li>
          <a href="/start/developer">Create your free developer profile</a>
        </li>
        <li>
          DenoDevs promotes your profile to employers that match your
          preferences
        </li>
        <li>
          Employers reach out to you with jobs or contracts
        </li>
      </ol>
      <p>
        <a href="/start/developer">Create your free developer profile now!</a>
      </p>

      <h2>Are you looking to hire a Deno developer?</h2>
      <p>Find out more here!</p>

      <div>
        <a href="/start/employer">
          Sign up to get matched with your ideal Deno developers!
        </a>
      </div>

      <h2>Made with Deno goodness</h2>

      <p>
        <a href="https://github.com/kevingorski/denodevs_com">
          DenoDevs is open source!
        </a>
      </p>

      <ol>
        <li>
          <a href="https://fresh.deno.dev">
            <img
              width="197"
              height="37"
              src="https://fresh.deno.dev/fresh-badge.svg"
              alt="Made with Fresh"
            />
          </a>
        </li>
        <li>
          <a href="https://deno.com/saaskit">Deno SaaSKit</a>
        </li>
        <li>
          <a href="https://deno.com/deploy">Deno Deploy</a>
        </li>
      </ol>
    </main>
  );
}
