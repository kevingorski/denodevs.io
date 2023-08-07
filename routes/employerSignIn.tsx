import { Handlers, PageProps } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import { setRedirectUrlCookie } from "@/utils/redirect.ts";
import { createEmployerLoginToken, getEmployer } from "@/utils/db.ts";
import { sendEmployerLoginEmailMessage } from "@/utils/email.ts";

interface EmployerSignInPageData extends State {
  email?: string;
  signInResult?: boolean;
}

export const handler: Handlers<EmployerSignInPageData, State> = {
  GET(_, ctx) {
    return ctx.render(ctx.state);
  },

  async POST(req, ctx) {
    const form = await req.formData();
    const email = form.get("email")?.toString();

    if (!email) {
      return new Response(null, { status: 400 });
    }

    const employer = await getEmployer(email);
    let signInResult = false;

    if (employer) {
      signInResult = true;

      const loginToken = await createEmployerLoginToken(employer);

      await sendEmployerLoginEmailMessage(employer, loginToken.token);
    }

    const response = await ctx.render({
      ...ctx.state,
      email,
      signInResult,
    });
    if (signInResult) {
      setRedirectUrlCookie(req, response);
    }
    return response;
  },
};

function SignInForm(props: { email: string }) {
  return (
    <form method="post">
      <label>
        Email:{" "}
        <input
          type="email"
          name="email"
          placeholder="Your email address"
          maxLength={255}
          value={props.email}
          required
        />
      </label>
      <button type="submit">Sign in</button>
    </form>
  );
}

function SuccessfulSignIn() {
  return (
    <p>
      Check your email for the sign in link. This link will expire in 10
      minutes.
    </p>
  );
}

function FailedSignIn(props: { email: string }) {
  return (
    <div>
      <p>That didn't work. Please try again.</p>
      <SignInForm email={props.email} />
    </div>
  );
}

export default function EmployerSignInPage(
  props: PageProps<EmployerSignInPageData>,
) {
  const signInResult = props.data.signInResult;
  return (
    <main>
      <h1>
        Employer Sign In
      </h1>

      {signInResult === true
        ? <SuccessfulSignIn />
        : signInResult === false
        ? <FailedSignIn email={props.data.email || ""} />
        : <SignInForm email={""} />}

      <h2>
        <a href="/">Home</a>
      </h2>
    </main>
  );
}
