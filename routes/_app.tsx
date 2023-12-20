import { PageProps } from "$fresh/server.ts";
import Header from "@/components/Header.tsx";
import Footer from "@/components/Footer.tsx";
import Meta from "@/components/Meta.tsx";
import { SITE_DESCRIPTION } from "../utils/constants.ts";
import { CLICKY_SITE_ID } from "@/utils/config.ts";
import buildPageTitle from "@/utils/pageTitle.ts";

export default function App(props: PageProps) {
  if (props.url.pathname.startsWith("/kv-insights")) {
    return <props.Component />;
  }

  const title = buildPageTitle(props.data?.title);

  return (
    <html lang="en">
      <head>
        <Meta
          title={title}
          description={props.data?.description ?? SITE_DESCRIPTION}
          href={props.url.href}
        />
        <meta name="viewport" content="width=device-width" />
        <link href="/styles.gen.css" rel="stylesheet" />
      </head>
      <body>
        <Header
          employerSessionId={props.data?.employerSessionId}
          sessionId={props.data?.sessionId}
        />
        <props.Component />
        <Footer
          employerSessionId={props.data?.employerSessionId}
          sessionId={props.data?.sessionId}
        />
        <script async data-id={CLICKY_SITE_ID} src="/56ac6c4e308a9" />
      </body>
    </html>
  );
}
