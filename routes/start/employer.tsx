// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";

export const handler: Handlers<State, State> = {
  async GET(req, ctx) {
    return ctx.render(ctx.state);
  },
};

export default function EmployerPage() {
  return (
    <main>
      <h1>
        Hello employer!
      </h1>

      <h2>
        <a href="/">Home</a>
      </h2>
    </main>
  );
}
