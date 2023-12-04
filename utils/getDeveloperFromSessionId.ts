import { getDeveloperBySession } from "@/utils/db.ts";

export const enum DeveloperSessionResult {
  NO_SESSION_ID,
  NO_DEVELOPER,
}

export default async function getDeveloperFromSessionId(
  sessionId: string | undefined,
) {
  if (!sessionId) return DeveloperSessionResult.NO_SESSION_ID;

  const developer = await getDeveloperBySession(sessionId);

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
