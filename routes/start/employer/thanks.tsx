import type { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";

export const handler: Handlers<State, State> = {
  GET(_, ctx) {
    return ctx.render(ctx.state);
  },
};

export default function EmployerThanksPage() {
  return (
    <main>
      <h1>
        Thanks For Signing Up!
      </h1>

      <p>
        You should receive a confirmation email from DenoDevs shortly, which
        will let you get started.
      </p>

      <h2>
        <a href="/">Home</a>
      </h2>
    </main>
  );
}
