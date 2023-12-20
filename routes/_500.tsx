import { PageProps } from "$fresh/server.ts";
import ContactSupportLink from "@/components/ContactSupportLink.tsx";
import { SITE_NAME } from "@/utils/constants.ts";

export default function Error500Page({ error, url }: PageProps) {
  const id = crypto.randomUUID();
  const supportMessageBody = `Hello, this is [Your Name Here].
  I was on ${SITE_NAME} at "${url}", but I ran into an error (ref ${id}).
  Here are more details:
  [Your Report Here]
  Please help!`;
  console.error(error, id);
  return (
    <main>
      <h1>Server error ☄️</h1>
      <p>
        Something went wrong on our side &mdash; the issue has been logged, but
        if you'd like to provide more context, please{" "}
        <ContactSupportLink
          linkText="contact Kevin"
          messageBody={supportMessageBody}
          messageSubject="Deno Devs Error "
        />.
      </p>
      <p>
        <a href="/">Return home</a>
      </p>
    </main>
  );
}
