import type { Handlers, PageProps, RouteConfig } from "$fresh/server.ts";
import ContactSupportLink from "@/components/ContactSupportLink.tsx";
import {
  EMPLOYER_SESSION_COOKIE_NAME,
  SIGN_IN_HELP_COOKIE_NAME,
  SITE_NAME,
} from "@/utils/constants.ts";
import { signOut } from "kv_oauth";
import { deleteCookie } from "std/http/cookie.ts";
import DeleteAccountButton from "@/islands/DeleteAccountButton.tsx";
import { useCSP } from "$fresh/src/runtime/csp.ts";
import denoDevsCsp from "@/utils/csp.ts";
import { EmployerState } from "@/routes/employer/_middleware.ts";
import { createCsrfToken, deleteEmployer } from "@/utils/db.ts";
import {
  ProtectedForm,
  readPostDataAndValidateCsrfToken,
} from "@/utils/csrf.ts";
import { CSRFInput } from "@/components/CRSFInput.tsx";

interface Props extends EmployerState, ProtectedForm {}

export const handler: Handlers<Props, EmployerState> = {
  async GET(_request, ctx) {
    ctx.state.title = "Delete My Account";
    const csrfToken = await createCsrfToken();
    return ctx.render({ ...ctx.state, csrfToken });
  },
  async POST(req, ctx) {
    await readPostDataAndValidateCsrfToken(req);
    const res = await signOut(req);
    await deleteEmployer(ctx.state.employer);
    deleteCookie(res.headers, EMPLOYER_SESSION_COOKIE_NAME, { path: "/" });
    deleteCookie(res.headers, SIGN_IN_HELP_COOKIE_NAME, { path: "/" });

    return res;
  },
};

export default function AccountPage(props: PageProps<Props>) {
  const messageBody =
    `Hello Kevin, I'm considering deleting my ${SITE_NAME} account because [Your Reason Here]...`;
  const messageSubject = `Deleting ${SITE_NAME} account`;
  useCSP(denoDevsCsp);
  return (
    <main>
      <h1>Delete Account</h1>
      <p>
        Here at {SITE_NAME}{" "}
        I always want to respect your privacy and maintain that your data is
        yours, I'm only borrowing it. If it's really time, here's the big red
        button:
      </p>
      <form method="post">
        <CSRFInput csrfToken={props.data.csrfToken} />
        <DeleteAccountButton />
      </form>
      <p>
        If something isn't quite right with your {SITE_NAME} experience, please
        {" "}
        <ContactSupportLink
          linkText="email Kevin"
          messageBody={messageBody}
          messageSubject={messageSubject}
        />{" "}
        and I'll see if I can make things right.
      </p>
    </main>
  );
}

export const config: RouteConfig = {
  csp: true,
};
