import type { Handlers } from "$fresh/server.ts";
import type { State } from "@/routes/_middleware.ts";
import { SITE_NAME, SITE_VERSION } from "@/utils/constants.ts";

export const handler: Handlers<State, State> = {
  GET(_, ctx) {
    return ctx.render(ctx.state);
  },
};

export default function HomePage() {
  return (
    <main>
      <h1>
        The reverse job board for <a href="https://deno.com">Deno</a> developers
      </h1>

      <p>
        {SITE_NAME}{" "}
        helps developers find their next job or contract working with Deno.
      </p>
      <p>
        Fill out your profile and what you're looking for and interested
        companies and projects will reach out to you.
      </p>
      <p>Currently in {SITE_VERSION}.</p>

      <div>
        <a href="/start">Get started</a>
        <a href="/about">Learn more</a>
      </div>
    </main>
  );
}
