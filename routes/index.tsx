import type { Handlers } from "$fresh/server.ts";
import type { State } from "@/routes/_middleware.ts";
import { SITE_NAME } from "@/utils/constants.ts";

export const handler: Handlers<State, State> = {
  GET(_, ctx) {
    return ctx.render(ctx.state);
  },
};

function CTA() {
  return (
    <div class="cta">
      <a class="button" href="/start/developer">
        Get your free profile now
      </a>
    </div>
  );
}

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
        <li>
          Don't sign yourself up for an email version of an untargeted job board
          – {SITE_NAME}{" "}
          will only send you jobs that match criteria that you set, and will
          even let you know when you could increase your matches (if you
          opt-in).
        </li>
      </ul>

      {CTA()}

      <h2>
        Finding a job on {SITE_NAME}
      </h2>
      <ol>
        <li>
          <a href="/start/developer">Create your free developer profile</a>{" "}
          in less than 10 minutes
        </li>
        <li>Set your job preferences</li>
        <li>
          Wait while {SITE_NAME}{" "}
          promotes your anonymized profile to employers that match your
          preferences
        </li>
        <li>
          Interested employers message you with jobs and you decide if you want
          to interview
        </li>
        <li>
          If you're hired (🎉), {SITE_NAME} is rewarded 💵
        </li>
      </ol>

      {CTA()}
    </main>
  );
}
