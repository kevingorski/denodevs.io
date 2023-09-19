import { AppProps } from "$fresh/server.ts";
import Header from "@/components/Header.tsx";
import Footer from "@/components/Footer.tsx";
import Meta from "@/components/Meta.tsx";
import {
  CLICKY_SITE_ID,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_VERSION,
} from "../utils/constants.ts";

export default function App(props: AppProps) {
  if (props.url.pathname === "/kv-insights") {
    return <props.Component />;
  }

  const siteName = `${SITE_NAME} ${SITE_VERSION}`;
  const title = props.data?.title
    ? `${props.data.title} 🦕💼 ${siteName}`
    : siteName;
  const clickyUrl = props.url.searchParams.has("proxy")
    ? "/56ac6c4e308a9"
    : "//static.getclicky.com/js";

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
        <script async data-id={CLICKY_SITE_ID} src={clickyUrl}>
        </script>
      </body>
    </html>
  );
}
