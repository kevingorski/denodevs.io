import type { Handlers, PageProps } from "$fresh/server.ts";
import type { State } from "./_middleware.ts";
import { redirect } from "@/utils/redirect.ts";
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

    if (ctx.state.sessionId !== undefined) return redirect("/account");

    return ctx.render({ ...ctx.state, from, signInHelp });
  },
};

export default function DeveloperSignInPage(
  props: PageProps<DeveloperSignInPageData>,
) {
  const { from, signInHelp } = props.data;
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

      <ul>
        <li>
          <SignInFormSupportLink
            userType={UserType.Developer}
          />
        </li>
        <li>
          <a href="/employerSignIn">Employer Sign In</a>
        </li>
      </ul>
    </main>
  );
}
