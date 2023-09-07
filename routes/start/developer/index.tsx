import type { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import {
  createDeveloper,
  createDeveloperSignInToken,
  newDeveloperProps,
} from "@/utils/db.ts";
import { sendWelcomeDeveloperEmailMessage } from "@/utils/email.ts";
import { redirect } from "@/utils/redirect.ts";
import { addDeveloperEmailToResponse } from "@/utils/signInHelp.ts";

export const handler: Handlers<State, State> = {
  GET(_, ctx) {
    return ctx.render(ctx.state);
  },
  async POST(req, _ctx) {
    const form = await req.formData();
    const email = form.get("email")?.toString();

    if (!email) {
      return new Response(null, { status: 400 });
    }

    const developer = {
      ...newDeveloperProps(),
      email,
    };
    const redirectToThanks = redirect("/start/developer/thanks");

    try {
      await createDeveloper(developer);
    } catch (_error) {
      // Don't leak knowledge of existing email address
      return redirectToThanks;
    }

    const loginToken = await createDeveloperSignInToken(developer);
    await sendWelcomeDeveloperEmailMessage(developer, loginToken.uuid);

    addDeveloperEmailToResponse(
      req,
      redirectToThanks,
      email,
    );

    return redirectToThanks;
  },
};

export default function DeveloperPage() {
  return (
    <main>
      <h1>
        Hello developer!
      </h1>

      <p>
        Already got an account? <a href="/signin">Sign in here</a>.
      </p>

      <p>
        To start creating your profile, first sign in with your GitHub account.
        The details of your GitHub account will be used to create your profile,
        but you can edit it and connect other accounts to it afterward.
      </p>

      <p>
        Your email address will be used to confirm your identity and send you
        updates about job matches and DenoDevs updates. If the email address on
        your GitHub account is not the one you'd like to use, it can be updated
        after the initial setup.
      </p>

      <p>
        In the future, you'll be able to showcase work on GitHub through this
        integration.
      </p>

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
        <button type="submit">Sign up</button>
      </form>

      <h2>
        <a href="/">Home</a>
      </h2>
    </main>
  );
}
