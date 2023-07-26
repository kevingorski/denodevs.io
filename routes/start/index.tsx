// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    return ctx.render();
  },
};

export default function StartPage() {
  return (
    <main>
      <h1>
        What brings you to DenoDevs today?
      </h1>

      <h2>
        <a href="/start/developer">I'm a Deno developer looking for work</a>
      </h2>

      <h2>
        <a href="/start/employer">I'm an employer hiring Deno developers</a>
      </h2>
    </main>
  );
}
