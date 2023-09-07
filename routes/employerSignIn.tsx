import { Handlers, PageProps } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import { redirect, setRedirectUrlCookie } from "@/utils/redirect.ts";
import { createEmployerSignInToken, getEmployerByEmail } from "@/utils/db.ts";
import { sendEmployerSignInEmailMessage } from "@/utils/email.ts";
import EmailSignInForm from "@/components/EmailSignInForm.tsx";
import SignInFormSupportLink from "@/components/SignInFormSupportLink.tsx";
import { UserType } from "@/types/UserType.ts";
import SignInHelp from "@/types/SignInHelp.ts";
import { getSignInHelpFromCookie } from "@/utils/signInHelp.ts";

interface EmployerSignInPageData extends State {
  email?: string;
  hasSubmitted: boolean;
  signInHelp: SignInHelp | null;
}

export const handler: Handlers<EmployerSignInPageData, State> = {
  GET(req, ctx) {
    const signInHelp = getSignInHelpFromCookie(req);
    if (ctx.state.employerSessionId !== undefined) return redirect("/");

    return ctx.render({ ...ctx.state, hasSubmitted: false, signInHelp });
  },

  async POST(req, ctx) {
    const form = await req.formData();
    const email = form.get("email")?.toString();
    const signInHelp = getSignInHelpFromCookie(req);

    if (!email) {
      return new Response(null, { status: 400 });
    }

    const employer = await getEmployerByEmail(email);
    let signInResult = false;

    if (employer) {
      signInResult = true;

      const signInToken = await createEmployerSignInToken(employer);

      await sendEmployerSignInEmailMessage(employer, signInToken.uuid);
    }

    const response = await ctx.render({
      ...ctx.state,
      email,
      hasSubmitted: true,
      signInHelp,
    });
    if (signInResult) {
      setRedirectUrlCookie(req, response);
    }
    return response;
  },
};

export default function EmployerSignInPage(
  props: PageProps<EmployerSignInPageData>,
) {
  const { email, hasSubmitted, signInHelp } = props.data;
  return (
    <main>
      <h1>
        Employer Sign In
      </h1>

      <EmailSignInForm
        email={email || ""}
        hasSubmitted={hasSubmitted}
        signInHelp={signInHelp}
        userType={UserType.Employer}
      />

      <ul>
        <li>
          <SignInFormSupportLink email={email} userType={UserType.Employer} />
        </li>
        <li>
          <a href="/start/employer">Employer Sign Up</a>
        </li>
        <li>
          <a href="/signin">Developer Sign In</a>
        </li>
      </ul>
    </main>
  );
}
