import type { Handlers, PageProps } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import {
  createCsrfToken,
  createDeveloper,
  createDeveloperSignInToken,
  newDeveloperProps,
} from "@/utils/db.ts";
import { sendWelcomeDeveloperEmailMessage } from "@/utils/email.ts";
import { redirect } from "@/utils/redirect.ts";
import { addDeveloperEmailToResponse } from "@/utils/signInHelp.ts";
import {
  ProtectedForm,
  readPostDataAndValidateCsrfToken,
} from "@/utils/csrf.ts";
import { CSRFInput } from "@/components/CRSFInput.tsx";

interface Props extends State, ProtectedForm {}

export const handler: Handlers<Props, State> = {
  async GET(_, ctx) {
    const csrfToken = await createCsrfToken();
    return ctx.render({ ...ctx.state, csrfToken });
  },
  async POST(req, _ctx) {
    const form = await readPostDataAndValidateCsrfToken(req);
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

export default function DeveloperPage(props: PageProps<Props>) {
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
        <CSRFInput csrfToken={props.data.csrfToken} />
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
