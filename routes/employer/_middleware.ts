import { State } from "@/routes/_middleware.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import {
  deleteEmployerSession,
  Employer,
  getEmployer,
  getEmployerSession,
  updateEmployer,
} from "@/utils/db.ts";
import { redirectToEmployerSignIn } from "@/utils/redirect.ts";
import { SESSION_COOKIE_LIFETIME_MS } from "@/utils/constants.ts";

export interface EmployerState extends State {
  employerSessionId: string;
  employer: Employer;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<EmployerState>,
) {
  const redirectResponse = redirectToEmployerSignIn(req.url);
  const { employerSessionId } = ctx.state;
  if (!employerSessionId) {
    console.error(`no employerSessionId found`);
    return redirectResponse;
  }

  const session = await getEmployerSession(employerSessionId);
  if (!session) {
    console.error(`employerSessionId ${employerSessionId} not found`);
    return redirectResponse;
  }

  if (
    session.generated + SESSION_COOKIE_LIFETIME_MS < Date.now()
  ) {
    console.error(
      `employerSessionId ${employerSessionId} too old (${
        session.generated + SESSION_COOKIE_LIFETIME_MS
      } < ${Date.now()})`,
    );
    await deleteEmployerSession(employerSessionId);
    return redirectResponse;
  }

  const employer = await getEmployer(session.entityId);

  if (!employer) {
    console.error(`employer ${session.entityId} not found`);
    return redirectResponse;
  }

  if (!employer.emailConfirmed) {
    employer.emailConfirmed = true;
    await updateEmployer(employer);
  }

  ctx.state.employer = employer;

  return await ctx.next();
}
