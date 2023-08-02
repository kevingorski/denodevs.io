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

      <p>
        Welcome to DenoDevs! Here you can sign up to be matched with developers
        for your open position or contract.
      </p>

      <p>
        DenoDevs is still in its early stages, which presents some unique
        challenges and opportunities for employers like yourself:
      </p>

      <ul>
        <li>There are few developers on the platform (for now)</li>
        <li>There will be some rough edges as the platform matures</li>
        <li>
          Your input is early and more likely to direct DenoDevs toward your
          needs
        </li>
        <li>There's no cost to you to sign up</li>
      </ul>

      <h2>
        <a href="/">Home</a>
      </h2>
    </main>
  );
}
