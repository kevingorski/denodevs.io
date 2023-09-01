import { EmployerState } from "@/routes/employer/_middleware.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import SignOutLink from "@/components/SignOutLink.tsx";
import { UserType } from "@/types/UserType.ts";

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

      <p>
        Thank you for joining Deno Devs as an employer! There isn't anything
        else for you to do for the moment, but we'll use the email address you
        provided ({props.data.employer.email}) to let you know the next steps in
        finding your next Deno developer.
      </p>

      <p>
        In the meantime, if you have any questions about Deno Devs, you can{" "}
        <a href="mailto:kevin@denodevs.io" title="Email Kevin re: Deno Devs">
          email the me (founder of Deno Devs) directly here
        </a>.
      </p>

      <SignOutLink userType={UserType.Employer} />
    </main>
  );
}
