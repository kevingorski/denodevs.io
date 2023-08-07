// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";

export const handler: Handlers<State, State> = {
  GET(_, ctx) {
    return ctx.render(ctx.state);
  },
};

export default function StartPage(props: PageProps<State>) {
  const devMessage = (
    <a href="/start/developer">I'm a Deno developer looking for work</a>
  );
  return (
    <main>
      <h1>
        What brings you to DenoDevs today?
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
