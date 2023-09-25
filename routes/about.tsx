import type { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import {
  KEVINS_EMAIL_ADDRESS,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/utils/constants.ts";
import gravatar from "gravatar";
import BlurHashedImage from "@/islands/BlurHashedImage.tsx";

const profileImageUrl = gravatar.url(KEVINS_EMAIL_ADDRESS, { s: "128" });
const profileHighResolutionImageUrl = gravatar.url(KEVINS_EMAIL_ADDRESS, {
  s: "256",
});
const profileImageBlurHash =
  "oQJQ.jX-L1r@=|s;~nIo%LRjWBoL55RP#mW=S2bbtRt7b0t7agt6ozRjxFWoI:xat6f6RQj?WVWX";

export const handler: Handlers<State, State> = {
  GET(_, ctx) {
    return ctx.render(ctx.state);
  },
};

export default function AboutPage() {
  return (
    <main class="AboutPage">
      <section class="Intro">
        <h1>
          {SITE_DESCRIPTION}
        </h1>
        <p>
          The Deno developer community is growing, but it's still rare to find
          relevant jobs and contracts. Stop searching for a needle in a
          haystack, let {SITE_NAME} help!
        </p>
      </section>
      <section>
        <h2>
          <a id="ForDenoDevelopers">For Deno Developers</a>
        </h2>
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
      </section>
      <section>
        <h2>
          <a id="ForEmployers">For Employers</a>
        </h2>
        <p>Find out more here!</p>

        <div>
          <a href="/start/employer">
            Sign up to get matched with your ideal Deno developers!
          </a>
        </div>
      </section>
      <section>
        <h2>
          <a id="MadeWithDeno">Made With Deno</a>
        </h2>
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
          <li>
            <a href="https://deno.com/kv">Deno KV</a>
          </li>
        </ol>
        <p>
          <a href="https://github.com/kevingorski/denodevs.io" target="_blank">
            DenoDevs is open source!
          </a>
          <iframe
            src="https://github.com/sponsors/kevingorski/button"
            title="Sponsor kevingorski"
            height="32"
            width="114"
            style="border: 0; border-radius: 6px;"
          >
          </iframe>
        </p>
      </section>
      <section>
        <h2>
          <a id="MadeByKevin">Made By Kevin</a>
        </h2>
        <BlurHashedImage
          alt="Photo of Kevin Gorski"
          blurhash={profileImageBlurHash}
          width={128}
          height={128}
          srcset={`${profileImageUrl}, ${profileHighResolutionImageUrl} 2x`}
          src={profileImageUrl}
          style="float:right; margin: 0 0 1em 1em;"
        />
        <p>
          My name is Kevin Gorski and I’m a{" "}
          <a href="https://kgsoftwarellc.com" target="_blank">
            freelance full-stack web engineer
          </a>{" "}
          with 18+ years real-world experience spanning multiple industries,
          tech stacks, and product maturities.
        </p>
        <p>
          I decided to build {SITE_NAME}{" "}
          when I was researching the possibility of working with Deno more
          professionally and found that a lot of platforms didn't even list it
          yet, despite being around for several years.
        </p>
        <p>
          <a href="https://railsdevs.com" target="_blank" rel="noreferrer">
            RailsDevs
          </a>{" "}
          was an example I looked to for inspiration, but I also wanted to
          leverage <a href="#MadeWithDeno">Deno and its ecosystem</a>.
        </p>
        <p>
          So here we are: a place for Deno developers to have their next
          employer find them. Hope this helps!
        </p>
      </section>
    </main>
  );
}
