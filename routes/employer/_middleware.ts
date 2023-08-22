import { State } from "@/routes/_middleware.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import {
  Employer,
  getEmployerBySession,
  updateEmployer,
  updateEmployerSession,
} from "@/utils/db.ts";
import { redirectToEmployerLogin } from "@/utils/redirect.ts";
import { EMPLOYER_SESSION_COOKIE_LIFETIME_MS } from "@/utils/constants.ts";

export interface EmployerState extends State {
  employerSessionId: string;
  employer: Employer;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<EmployerState>,
) {
  const redirectResponse = redirectToEmployerLogin(req.url);
  const employerSessionId = ctx.state.employerSessionId;
  if (!employerSessionId) return redirectResponse;

  const employer = await getEmployerBySession(ctx.state.employerSessionId);
  if (!employer) return redirectResponse;
  if (
    employer.sessionGenerated + EMPLOYER_SESSION_COOKIE_LIFETIME_MS < Date.now()
  ) {
    await updateEmployerSession(employer);
    // TODO: message for expired session
    return redirectResponse;
  }

  if (!employer.emailConfirmed) {
    employer.emailConfirmed = true;
    await updateEmployer(employer);
  }

  ctx.state.employer = employer;

  return await ctx.next();
}
