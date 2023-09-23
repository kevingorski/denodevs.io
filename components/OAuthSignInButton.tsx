import { OAuthProvider } from "@/types/OAuthProvider.ts";
import SignInHelp from "@/types/SignInHelp.ts";
import { ComponentChildren } from "preact";
import { GitHub } from "@/components/Icons.tsx";

interface Props {
  children: ComponentChildren;
  oAuthProvider: OAuthProvider;
  signInHelp: SignInHelp | null;
  successUrl: string;
}

export default function OAuthSignInButton(props: Props) {
  const { children, oAuthProvider, signInHelp, successUrl } = props;
  const hasSignedInBefore = signInHelp?.developerOAuthProviders?.includes(
    oAuthProvider,
  );
  const classNames = `button button--${oAuthProvider} ${
    hasSignedInBefore ? "button--previousSignIn" : ""
  }`;
  const signInUrl =
    `/signInOAuth?provider=${oAuthProvider}&success_url=${successUrl}`;
  return (
    <a class={classNames} href={signInUrl}>
      {children}
    </a>
  );
}

export function GitHubOAuthSignInButton(
  props: Omit<Props, "children" | "oAuthProvider">,
) {
  return (
    <OAuthSignInButton {...props} oAuthProvider={OAuthProvider.GITHUB}>
      <GitHub /> Sign in with GitHub
    </OAuthSignInButton>
  );
}

export function GoogleOAuthSignInButton(
  props: Omit<Props, "children" | "oAuthProvider">,
) {
  return (
    <OAuthSignInButton {...props} oAuthProvider={OAuthProvider.GOOGLE}>
      G Sign in with Google
    </OAuthSignInButton>
  );
}
