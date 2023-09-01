import { Handlers, PageProps } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import { redirect, setRedirectUrlCookie } from "@/utils/redirect.ts";
import { createEmployerSignInToken, getEmployerByEmail } from "@/utils/db.ts";
import { sendEmployerSignInEmailMessage } from "@/utils/email.ts";
import EmailSignInForm from "@/components/EmailSignInForm.tsx";
import SignInFormSupportLink from "@/components/SignInFormSupportLink.tsx";
import { UserType } from "@/types/UserType.ts";

interface EmployerSignInPageData extends State {
  email?: string;
  hasSubmitted: boolean;
}

export const handler: Handlers<EmployerSignInPageData, State> = {
  GET(_, ctx) {
    if (ctx.state.employerSessionId !== undefined) return redirect("/");

    return ctx.render({ ...ctx.state, hasSubmitted: false });
  },

  async POST(req, ctx) {
    const form = await req.formData();
    const email = form.get("email")?.toString();

    if (!email) {
      return new Response(null, { status: 400 });
    }

    const employer = await getEmployerByEmail(email);
    let signInResult = false;

    if (employer) {
      signInResult = true;

      const loginToken = await createEmployerSignInToken(employer);

      await sendEmployerSignInEmailMessage(employer, loginToken.uuid);
    }

    const response = await ctx.render({
      ...ctx.state,
      email,
      hasSubmitted: true,
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
  const { email, hasSubmitted } = props.data;
  return (
    <main>
      <h1>
        Employer Sign In
      </h1>

      <EmailSignInForm email={email || ""} hasSubmitted={hasSubmitted} />

      <ul>
        <li>
          <SignInFormSupportLink email={email} userType={UserType.Employer} />
        </li>
        <li>
          <a href="/signin">Developer Sign In</a>
        </li>
      </ul>
    </main>
  );
}
