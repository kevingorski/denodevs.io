import { AppProps } from "$fresh/server.ts";
import Header from "@/components/Header.tsx";
import Footer from "@/components/Footer.tsx";
import Meta from "@/components/Meta.tsx";
import { SITE_DESCRIPTION, SITE_NAME } from "../utils/constants.ts";

export default function App(props: AppProps) {
  return (
    <html lang="en">
      <head>
        <Meta
          title={props.data?.title
            ? `${props.data.title} 🦕💼 ${SITE_NAME}`
            : SITE_NAME}
          description={props.data?.description ?? SITE_DESCRIPTION}
          href={props.url.href}
        />
        <meta name="viewport" content="width=device-width" />
        <link href="/styles.css" rel="stylesheet" />
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
      </body>
    </html>
  );
}
