import type { Handlers } from "$fresh/server.ts";
import type { State } from "@/routes/_middleware.ts";
import { SITE_NAME } from "@/utils/constants.ts";

export const handler: Handlers<State, State> = {
  GET(_, ctx) {
    return ctx.render(ctx.state);
  },
};

export default function HomePage() {
  return (
    <main>
      <h1>
        Get matched async with employers hiring for{"  "}
        <a href="https://deno.com">Deno</a> jobs
      </h1>

      <p>
        Stop wasting time sifting through job boards hoping to find work using
        Deno, the next-generation JavaScript runtime.
      </p>
      <ul>
        <li>
          Many job boards don't even have Deno in their search criteria yet, but
          all jobs on {SITE_NAME} involve working with Deno.
        </li>
        <li>
          No more finding a job posting, then realizing it was filled months ago
          and only listed to boost SEO of the job board – {SITE_NAME}{" "}
          only notifies you when an employer is actively hiring.
        </li>
        <li>
          <abbr title="Don't Repeat Yourself">DRY</abbr>: Already have a profile
          at another site? Use it as a starting point here and we'll help you
          customize it for jobs working with Deno and the latest skills
          employers are looking for.
        </li>
      </ul>

      <div class="cta">
        <a class="button" href="/start/developer">
          Get your free profile now
        </a>
      </div>

      <h2>
        Get your free profile and you'll be matched with employers that are
        hiring
      </h2>
      <p>
        Fill out your profile and what you're looking for and interested
        companies and projects will reach out to you.
      </p>

      <div class="cta">
        <a class="button" href="/start/developer">
          Get your free profile now
        </a>
      </div>

      <h2>Need more details?</h2>
      <p>
        <a href="/about">
          Learn how {SITE_NAME} works differently from other job boards
        </a>.
      </p>
    </main>
  );
}
