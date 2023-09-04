import type { Handlers, PageProps } from "$fresh/server.ts";
import type { State } from "./_middleware.ts";
import { redirect, setRedirectUrlCookie } from "@/utils/redirect.ts";
import { createDeveloperSignInToken, getDeveloperByEmail } from "@/utils/db.ts";
import { sendDeveloperSignInEmailMessage } from "@/utils/email.ts";
import EmailSignInForm from "@/components/EmailSignInForm.tsx";
import SignInFormSupportLink from "@/components/SignInFormSupportLink.tsx";
import { UserType } from "@/types/UserType.ts";
import { GitHub } from "@/components/Icons.tsx";
import { OAuthProvider } from "@/types/OAuthProvider.ts";
import { SITE_BASE_URL } from "@/utils/constants.ts";

interface DeveloperSignInPageData extends State {
  from: string | null;
  email?: string;
  hasSubmitted: boolean;
}

export const handler: Handlers<DeveloperSignInPageData, State> = {
  /**
   * Redirects the client to the authenticated redirect path if already login.
   * If not logged in, it continues to rendering the login page.
   */
  GET(req, ctx) {
    const from = new URL(req.url).searchParams.get("from");

    if (ctx.state.sessionId !== undefined) return redirect("/");

    return ctx.render({ ...ctx.state, from, hasSubmitted: false });
  },

  async POST(req, ctx) {
    const form = await req.formData();
    const from = new URL(req.url).searchParams.get("from");
    const email = form.get("email")?.toString();

    if (!email) {
      return new Response(null, { status: 400 });
    }
    const developer = await getDeveloperByEmail(email);
    let signInResult = false;

    if (developer) {
      signInResult = true;

      const loginToken = await createDeveloperSignInToken(developer);

      await sendDeveloperSignInEmailMessage(developer, loginToken.uuid);
    }

    const response = await ctx.render({
      ...ctx.state,
      email,
      from,
      hasSubmitted: true,
    });
    if (signInResult) {
      setRedirectUrlCookie(req, response);
    }
    return response;
  },
};

export default function DeveloperSignInPage(
  props: PageProps<DeveloperSignInPageData>,
) {
  const { email, from, hasSubmitted } = props.data;
  const successUrl = from && from.startsWith(SITE_BASE_URL)
    ? from
    : `${SITE_BASE_URL}/account`;
  const gitHubSignInUrl =
    `/signInOAuth?provider=${OAuthProvider.GITHUB}&success_url=${successUrl}`;

  return (
    <main>
      <h1>
        Developer Sign In
      </h1>

      <h2>Sign in with your GitHub account</h2>

      <a class="button" href={gitHubSignInUrl}>
        <GitHub /> Sign in with GitHub
      </a>

      <h2>Get a magic sign in link via email</h2>

      <EmailSignInForm email={email || ""} hasSubmitted={hasSubmitted} />

      <ul>
        <li>
          <SignInFormSupportLink email={email} userType={UserType.Developer} />
        </li>
        <li>
          <a href="/employerSignIn">Employer Sign In</a>
        </li>
      </ul>
    </main>
  );
}
