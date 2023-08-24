import type { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import { redirect } from "@/utils/redirect.ts";
import {
  createEmployer,
  createEmployerLoginToken,
  newEmployerProps,
} from "@/utils/db.ts";
import { sendWelcomeEmployerEmailMessage } from "@/utils/email.ts";

export const handler: Handlers<State, State> = {
  GET(_, ctx) {
    return ctx.render(ctx.state);
  },

  async POST(req, ctx) {
    const form = await req.formData();
    const email = form.get("email")?.toString();
    const name = form.get("name")?.toString();
    const company = form.get("company")?.toString();

    if (!email || !name || !company) {
      return new Response(null, { status: 400 });
    }

    let employer;

    try {
      employer = await createEmployer({
        email,
        name,
        company,
        ...newEmployerProps(),
      });
    } catch (e) {
      // TODO: handle duplicate email
      return new Response(null, { status: 500 });
    }

    const loginToken = await createEmployerLoginToken(employer);

    await sendWelcomeEmployerEmailMessage(employer, loginToken.uuid);

    return redirect("/start/employer/thanks");
  },
};

export default function EmployerSignUpPage() {
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
        Already got an account? <a href="/employerSignIn">Sign in here</a>.
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

      <form method="post">
        <label>
          Email:{" "}
          <input
            type="email"
            name="email"
            placeholder="Your email address"
            maxLength={255}
            required
          />
        </label>
        <label>
          Full name:
          <input
            type="text"
            name="name"
            placeholder="Your full name"
            required
          />
        </label>
        <label>
          Company:
          <input
            type="text"
            name="company"
            placeholder="Your company"
            required
          />
        </label>
        <button type="submit">Sign up</button>
      </form>

      <h2>
        <a href="/">Home</a>
      </h2>
    </main>
  );
}
