
import { State } from "@/routes/_middleware.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import {
  Employer,
  getEmployerBySession,
  updateEmployerSession,
} from "@/utils/db.ts";
import { redirectToEmployerLogin } from "@/utils/redirect.ts";
import { EMPLOYER_SESSION_COOKIE_LIFETIME } from "@/utils/constants.ts";

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
    employer.sessionGenerated + EMPLOYER_SESSION_COOKIE_LIFETIME < Date.now()
  ) {
    await updateEmployerSession(employer);
    // TODO: message for expired session
    return redirectResponse;
  }

  ctx.state.employer = employer;

  return await ctx.next();
}
