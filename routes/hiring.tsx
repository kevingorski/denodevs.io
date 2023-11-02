import type { Handlers } from "$fresh/server.ts";
import type { State } from "@/routes/_middleware.ts";
import { SITE_NAME, SITE_VERSION } from "@/utils/constants.ts";

export const handler: Handlers<State, State> = {
  GET(_, ctx) {
    return ctx.render(ctx.state);
  },
};

function CTA() {
  return (
    <div class="cta">
      <a class="button" href="/start/employer">
        Get your free account now
      </a>
    </div>
  );
}

export default function HiringPage() {
  return (
    <main>
      <h1>
        Get matched with developers looking for{" "}
        <a href="https://deno.com">Deno</a> jobs
      </h1>

      <p>
        Stop wasting time posting to job boards hoping to find devs looking to
        work wiith Deno and start filling your open positions.
      </p>

      {CTA()}

      <h2>A note about the {SITE_NAME} {SITE_VERSION}</h2>
      <p>
        {SITE_NAME}{" "}
        is still in its early stages, which presents some unique challenges and
        opportunities for employers like yourself:
      </p>

      <ul>
        <li>There are few developers (for now)</li>
        <li>There will be some rough edges</li>
        <li>
          Your input is early and more likely to direct {SITE_NAME}{" "}
          toward your needs
        </li>
      </ul>

      <p>
        Once there are enough developers on{" "}
        {SITE_NAME}, the matching process is expected to look like this:
      </p>

      <ul>
        <li>
          {SITE_NAME}{" "}
          will send an email letting you know we're ready for job listings
        </li>
        <li>
          When you're looking to hire for a job, you'll share details about it
          via the site or email
        </li>
        <li>
          {SITE_NAME}{" "}
          will send you anonymized, matching developer profiles on a weekly
          basis as long as the position is open and you have an active
          subscription
        </li>
        <li>
          Any developers interested in the position will respond to you and
          their full profiles will be available to you
        </li>
        <li>You decide whether to continue and hire one of the deveopers</li>
        <li>
          If a hire is made, {SITE_NAME}{" "}
          earns a 10% of first-year salary or contract value success award
        </li>
      </ul>

      {CTA()}
    </main>
  );
}
