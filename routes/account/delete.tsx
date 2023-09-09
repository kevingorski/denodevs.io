import type { Handlers, PageProps, RouteConfig } from "$fresh/server.ts";
import { AccountState } from "@/routes/account/_middleware.ts";
import ContactSupportLink from "@/components/ContactSupportLink.tsx";
import { SIGN_IN_HELP_COOKIE_NAME, SITE_NAME } from "@/utils/constants.ts";
import { createCsrfToken, deleteDeveloper } from "@/utils/db.ts";
import { signOut } from "kv_oauth";
import { deleteCookie } from "std/http/cookie.ts";
import DeleteAccountButton from "@/islands/DeleteAccountButton.tsx";
import { useCSP } from "$fresh/src/runtime/csp.ts";
import denoDevsCsp from "@/utils/csp.ts";
import {
  ProtectedForm,
  readPostDataAndValidateCsrfToken,
} from "@/utils/csrf.ts";
import { CSRFInput } from "@/components/CRSFInput.tsx";

interface Props extends AccountState, ProtectedForm {}

export const handler: Handlers<Props, AccountState> = {
  async GET(_request, ctx) {
    ctx.state.title = "Delete My Account";
    const csrfToken = await createCsrfToken();
    return ctx.render({ ...ctx.state, csrfToken });
  },
  async POST(req, ctx) {
    await readPostDataAndValidateCsrfToken(req);
    const res = await signOut(req);
    await deleteDeveloper(ctx.state.developer);
    deleteCookie(res.headers, SIGN_IN_HELP_COOKIE_NAME, { path: "/" });

    return res;
  },
};

export default function DeleteAccountPage(props: PageProps<Props>) {
  const messageBody =
    `Hello Kevin, I'm considering deleting my ${SITE_NAME} account because [Your Reason Here]...`;
  const messageSubject = `Deleting ${SITE_NAME} account`;
  useCSP(denoDevsCsp);
  return (
    <main>
      <h1>Delete Account</h1>
      <p>
        Here at DenoDevs I always want to respect your privacy and maintain that
        your data is yours, I'm only borrowing it. If it's really time, here's
        the big red button:
      </p>
      <form method="post">
        <CSRFInput csrfToken={props.data.csrfToken} />
        <DeleteAccountButton />
      </form>
      <p>
        If something isn't quite right with your DenoDevs experience, please
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
