import { SITE_NAME } from "@/utils/constants.ts";
import { stripe } from "@/utils/payments.ts";
import AuthenticationLinks from "@/components/AuthenticationLinks.tsx";

export default function Header(
  props: { employerSessionId?: string; sessionId?: string },
) {
  return (
    <header class="SiteBar">
      <h1>
        <a href="/">{SITE_NAME}</a>
      </h1>
      <nav class="SiteNav">
        {stripe ? <a href="/pricing">Pricing</a> : null}
        <AuthenticationLinks {...props} />
        <a href="/about">About</a>
      </nav>
    </header>
  );
}
