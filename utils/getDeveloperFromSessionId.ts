import { getDeveloper, getDeveloperSession } from "@/utils/db.ts";
import { SESSION_COOKIE_LIFETIME_MS } from "@/utils/constants.ts";

export const enum DeveloperSessionResult {
  NO_SESSION_ID,
  NO_SESSION,
  EXPIRED_SESSION,
  NO_DEVELOPER,
}

export default async function getDeveloperFromSessionId(
  sessionId: string | undefined,
) {
  if (!sessionId) return DeveloperSessionResult.NO_SESSION_ID;

  const session = await getDeveloperSession(sessionId);
  if (!session) {
    return DeveloperSessionResult.NO_SESSION;
  }

  if (
    session.generated + SESSION_COOKIE_LIFETIME_MS < Date.now()
  ) {
    return DeveloperSessionResult.EXPIRED_SESSION;
  }

  const developer = await getDeveloper(session.entityId);

  if (!developer) {
    return DeveloperSessionResult.NO_DEVELOPER;
  }

  return developer;
}

export async function getDeveloperOrNullFromSessionId(
  sessionId: string | undefined,
) {
  const maybeDeveloper = await getDeveloperFromSessionId(sessionId);
  return typeof maybeDeveloper === "object" ? maybeDeveloper : null;
}
