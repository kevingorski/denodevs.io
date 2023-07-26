// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    return ctx.render();
  },
};

export default function AboutPage() {
  return (
    <main>
      <h1>
        More about DenoDevs – the reverse job board for Deno developers
      </h1>

      <h2>
        DenoDevs helps developers find their next job or contract working with
        Deno.
      </h2>
      <p>
        The community of Deno developers is growing, but it's still rare to find
        job listings and contracts to work with Deno. This is an attempt to
        solve one part of the chicken and egg situation by gathering developer
        profiles.
      </p>
      <p>
        Inspired by <a href="https://railsdevs.com/">RailsDevs</a>.
      </p>
      <p>Built with Deno/Fresh/DenoDeploy.</p>

      <h2>Are you looking to hire a Deno developer?</h2>
      <p>Find out more here!</p>

      <div>
        <a href="/start">Get started</a>
      </div>
    </main>
  );
}
