import { EmployerState } from "@/routes/employer/_middleware.ts";
import { Handlers, PageProps } from "$fresh/server.ts";

export const handler: Handlers<EmployerState, EmployerState> = {
  GET(_, ctx) {
    return ctx.render(ctx.state);
  },
};

export default function EmployerHomePage(props: PageProps<EmployerState>) {
  return (
    <main>
      <h1>Welcome {props.data.employer.name}!</h1>
      <h2>Representing {props.data.employer.company}</h2>
    </main>
  );
}
