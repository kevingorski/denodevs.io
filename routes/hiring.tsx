import type { Handlers } from "$fresh/server.ts";
import type { State } from "@/routes/_middleware.ts";
import { SITE_NAME, SITE_VERSION } from "@/utils/constants.ts";

export const handler: Handlers<State, State> = {
  GET(_, ctx) {
    return ctx.render(ctx.state);
  },
};

export default function HiringPage() {
  return (
    <main>
      <h1>
        Get matched with developers looking for{"  "}
        <a href="https://deno.com">Deno</a> jobs
      </h1>

      <p>
        Welcome to{" "}
        {SITE_NAME}! Here you can sign up to be matched with developers for your
        open jobs.
      </p>

      <p>
        Stop wasting time posting to job boards hoping to find devs looking to
        work wiith Deno and start filling your open positions.
      </p>

      <h2>A note about the {SITE_NAME} {SITE_VERSION}</h2>
      <p>
        {SITE_NAME}{" "}
        is still in its early stages, which presents some unique challenges and
        opportunities for employers like yourself:
      </p>

      <ul>
        <li>There are few developers on the platform (for now)</li>
        <li>There will be some rough edges as the platform matures</li>
        <li>
          Your input is early and more likely to direct {SITE_NAME}{" "}
          toward your needs
        </li>
        <li>There's no cost to you to sign up</li>
      </ul>
    </main>
  );
}
