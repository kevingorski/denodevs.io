import type { Handlers, PageProps } from "$fresh/server.ts";
import type { State } from "./_middleware.ts";
import { redirect, setRedirectUrlCookie } from "@/utils/redirect.ts";
import { createDeveloperSignInToken, getDeveloperByEmail } from "@/utils/db.ts";
import { sendDeveloperSignInEmailMessage } from "@/utils/email.ts";
import EmailSignInForm from "@/components/EmailSignInForm.tsx";
import SignInFormSupportLink from "@/components/SignInFormSupportLink.tsx";
import { UserType } from "@/types/UserType.ts";
import SignInHelp from "@/types/SignInHelp.ts";
import { getSignInHelpFromCookie } from "@/utils/signInHelp.ts";
import {
  GitHubOAuthSignInButton,
  GoogleOAuthSignInButton,
} from "@/components/OAuthSignInButton.tsx";
import { SITE_BASE_URL } from "@/utils/config.ts";

interface DeveloperSignInPageData extends State {
  from: string | null;
  email?: string;
  hasSubmitted: boolean;
  signInHelp: SignInHelp | null;
}

export const handler: Handlers<DeveloperSignInPageData, State> = {
  /**
   * Redirects the client to the authenticated redirect path if already signed in.
   * If not signed in, it continues to rendering the sign in page.
   */
  GET(req, ctx) {
    const from = new URL(req.url).searchParams.get("from");
    const signInHelp = getSignInHelpFromCookie(req);

    if (ctx.state.sessionId !== undefined) return redirect("/");

    return ctx.render({ ...ctx.state, from, hasSubmitted: false, signInHelp });
  },

  async POST(req, ctx) {
    const form = await req.formData();
    const from = new URL(req.url).searchParams.get("from");
    const email = form.get("email")?.toString();
    const signInHelp = getSignInHelpFromCookie(req);

    if (!email) {
      return new Response(null, { status: 400 });
    }
    const developer = await getDeveloperByEmail(email);
    let signInResult = false;

    if (developer) {
      signInResult = true;

      const signInToken = await createDeveloperSignInToken(developer);

      await sendDeveloperSignInEmailMessage(developer, signInToken.uuid);
    }

    const response = await ctx.render({
      ...ctx.state,
      email,
      from,
      hasSubmitted: true,
      signInHelp,
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
  const { email, from, hasSubmitted, signInHelp } = props.data;
  const successUrl = from && from.startsWith(SITE_BASE_URL)
    ? from
    : `${SITE_BASE_URL}/account`;

  return (
    <main>
      <h1>
        Developer Sign In
      </h1>

      <h2>Sign in with your GitHub account</h2>

      <GitHubOAuthSignInButton
        signInHelp={signInHelp}
        successUrl={successUrl}
      />

      <GoogleOAuthSignInButton
        signInHelp={signInHelp}
        successUrl={successUrl}
      />

      <h2>Get a magic sign in link via email</h2>

      <EmailSignInForm
        email={email || ""}
        hasSubmitted={hasSubmitted}
        signInHelp={signInHelp}
        userType={UserType.Developer}
      />

      <ul>
        <li>
          <SignInFormSupportLink
            email={email}
            userType={UserType.Developer}
          />
        </li>
        <li>
          <a href="/start/developer">Developer Sign Up</a>
        </li>
        <li>
          <a href="/employerSignIn">Employer Sign In</a>
        </li>
      </ul>
    </main>
  );
}
