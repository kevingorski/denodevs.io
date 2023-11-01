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
import { SITE_NAME } from "@/utils/constants.ts";

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
        Already have an account? <a href="/signin">Sign in here</a>.
      </p>

      <p>
        Your email address will be used to confirm your identity and send you
        updates about job matches and {SITE_NAME}.
      </p>

      <p>
        After initial sign up, you'll be able to connect and sign in with OAuth
        2.0 providers.
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
    </main>
  );
}
