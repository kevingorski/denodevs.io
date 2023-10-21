import type { Handlers, PageProps } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import { redirect } from "@/utils/redirect.ts";
import {
  createCsrfToken,
  createEmployer,
  createEmployerSignInToken,
  newEmployerProps,
} from "@/utils/db.ts";
import { sendWelcomeEmployerEmailMessage } from "@/utils/email.ts";
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

  async POST(req, ctx) {
    const form = await readPostDataAndValidateCsrfToken(req);
    const email = form.get("email")?.toString();
    const name = form.get("name")?.toString();
    const company = form.get("company")?.toString();

    if (!email || !name || !company) {
      return new Response(null, { status: 400 });
    }

    let employer;
    const redirectToThanks = redirect("/start/employer/thanks");

    try {
      employer = await createEmployer({
        email,
        name,
        company,
        ...newEmployerProps(),
      });
    } catch (_error) {
      // Don't leak knowledge of existing email address
      return redirectToThanks;
    }

    const loginToken = await createEmployerSignInToken(employer);

    await sendWelcomeEmployerEmailMessage(employer, loginToken.uuid);

    return redirectToThanks;
  },
};

export default function EmployerSignUpPage(props: PageProps<Props>) {
  return (
    <main>
      <h1>
        Hello employer!
      </h1>

      <p>
        Welcome to{" "}
        {SITE_NAME}! Here you can sign up to be matched with developers for your
        open position or contract.
      </p>

      <p>
        Already got an account? <a href="/employerSignIn">Sign in here</a>.
      </p>

      <p>
        {SITE_NAME}{" "}
        is still in its early stages, which presents some unique challenges and
        opportunities for employers like yourself:
      </p>

      <ul>
        <li>There are few developers on the platform (for now)</li>
        <li>There will be some rough edges as the platform matures</li>
        <li>
          Your input is early and more likely to direct {SITE_NAME}{" "}
          toward your needs
        </li>
        <li>There's no cost to you to sign up</li>
      </ul>

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
