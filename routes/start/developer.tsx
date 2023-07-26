// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    return ctx.render();
  },
};

export default function DeveloperPage() {
  return (
    <main>
      <h1>
        Hello developer!
      </h1>

      <h2>
        <a href="/">Home</a>
      </h2>
    </main>
  );
}
