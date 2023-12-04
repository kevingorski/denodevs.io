import type { Handlers, PageProps } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import { SITE_NAME } from "@/utils/constants.ts";

export const handler: Handlers<State, State> = {
  GET(_, ctx) {
    return ctx.render(ctx.state);
  },
};

export default function StartPage(props: PageProps<State>) {
  const devMessage = (
    <a href="/signin">
      I'm a Deno developer looking for work
    </a>
  );
  return (
    <main>
      <h1>
        What brings you to {SITE_NAME} today?
      </h1>

      <h2>
        {props.state.sessionId ? <del>{devMessage}</del> : devMessage}
      </h2>

      <h2>
        <a href="/start/employer">I'm an employer hiring Deno developers</a>
      </h2>
    </main>
  );
}
