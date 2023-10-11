import { SITE_NAME } from "@/utils/constants.ts";
import { GitHub } from "./Icons.tsx";
import AuthenticationLinks from "@/components/AuthenticationLinks.tsx";
import ContactSupportLink from "@/components/ContactSupportLink.tsx";

export default function Footer(
  props: {
    employerSessionId?: string;
    sessionId?: string;
  },
) {
  return (
    <footer class="SiteBar">
      <p>© {SITE_NAME}</p>
      <nav class="SiteNav">
        <AuthenticationLinks {...props} />
        <a href="/about">About</a>
        <a href="/privacyPolicy">Privacy</a>
        <ContactSupportLink
          linkText="📧"
          messageBody={`Hello there, I have feedback about ${SITE_NAME}: [Your Feedback Here]`}
          messageSubject={`Send ${SITE_NAME} Feedback`}
          titleText={`Send ${SITE_NAME} Feedback`}
        />
        <a
          href="https://github.com/kevingorski/denodevs.io"
          target="_blank"
          aria-label={`${SITE_NAME} repo on GitHub`}
        >
          <GitHub />
        </a>
      </nav>
    </footer>
  );
}
