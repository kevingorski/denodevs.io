import { Handlers, PageProps } from "$fresh/server.ts";
import { AdminState } from "@/utils/adminAccessHandler.ts";
import { EmailMessage } from "@/utils/email.ts";

interface TemplateSample {
  name: string;
  message: EmailMessage;
}

interface Props extends AdminState {
  templateSamples: TemplateSample[];
}

export const handler: Handlers<Props, AdminState> = {
  GET(_, ctx) {
    return ctx.render({ ...ctx.state, templateSamples: [] });
  },
};

export default function EmailTemplatesPage(props: PageProps<Props>) {
  return (
    <main>
      <h1>Email Templates</h1>
    </main>
  );
}
