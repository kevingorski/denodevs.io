import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import buildPageTitle from "@/utils/pageTitle.ts";
import ContactSupportLink from "@/components/ContactSupportLink.tsx";
import { SITE_NAME } from "@/utils/constants.ts";

export default function NotFoundPage({ url }: PageProps) {
  const supportMessageBody = `Hello, this is [Your Name Here].
  I was trying to access "${url}" on ${SITE_NAME}, but it wasn't found.
  I think it should work because [Your Reason Here].
  Please help!`;
  return (
    <>
      {/* NB: 404 page can't have custom handler to pass title into */}
      <Head>
        <title>{buildPageTitle("Page not found")}</title>
      </Head>
      <main>
        <h1>Page not found ∅</h1>
        <p>
          It doesn't look like this page exists &mdash; if you think it should,
          {" "}
          <ContactSupportLink
            linkText="contact Kevin"
            messageBody={supportMessageBody}
            messageSubject="Deno Devs Page Not Found"
            titleText="Contact Kevin"
          />.
        </p>
        <p>
          <a href="/">Return home</a>
        </p>
      </main>
    </>
  );
}
