import { SITE_NAME } from "@/utils/constants.ts";
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
        <AuthenticationLinks {...props} />
        <a href="/hiring">Hiring Deno devs?</a>
        <a href="/about">About</a>
      </nav>
    </header>
  );
}
