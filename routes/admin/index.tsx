import { Handlers, PageProps } from "$fresh/server.ts";
import { AdminState } from "@/utils/adminAccessHandler.ts";

export const handler: Handlers<AdminState, AdminState> = {
  GET(_, ctx) {
    return ctx.render(ctx.state);
  },
};

export default function AdminHomePage(props: PageProps<AdminState>) {
  return (
    <main>
      <h1>Welcome Admin!</h1>
      <h2>Representing Deno Devs</h2>
    </main>
  );
}
