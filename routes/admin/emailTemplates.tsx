import { Handlers, PageProps } from "$fresh/server.ts";
import { AdminState } from "@/utils/adminAccessHandler.ts";
import { renderTemplateSamples, TemplateSample } from "@/utils/email.ts";

interface Props extends AdminState {
  templateSamples: TemplateSample[];
}

export const handler: Handlers<Props, AdminState> = {
  GET(_, ctx) {
    return ctx.render({
      ...ctx.state,
      templateSamples: renderTemplateSamples(),
    });
  },
};

export default function EmailTemplatesPage(props: PageProps<Props>) {
  return (
    <main>
      <h1>Email Templates</h1>
      <hr />
      {props.data.templateSamples.map((sample) => {
        const innerHtml = { __html: sample.message.html };
        return (
          <>
            <h2>{sample.name}</h2>
            <ul>
              <li>To: {sample.message.to}</li>
              <li>Subject: {sample.message.subject}</li>
            </ul>
            <div dangerouslySetInnerHTML={innerHtml} />
          </>
        );
      })}
    </main>
  );
}
