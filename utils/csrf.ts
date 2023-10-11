import { getCsrfToken } from "@/utils/db.ts";
import { ExpiringUUID } from "@/types/ExpiringUUID.ts";
import {
  CSRF_TOKEN_INPUT_NAME,
  CSRF_TOKEN_LIFETIME_MS,
} from "@/utils/constants.ts";

export interface ProtectedForm {
  csrfToken: ExpiringUUID;
}

export async function isCsrfTokenValid(uuid: string) {
  const csrfToken = await getCsrfToken(uuid);
  if (!csrfToken) {
    return false;
  }
  const now = Date.now();
  const expiration = csrfToken.generated + CSRF_TOKEN_LIFETIME_MS;
  if (expiration < now) {
    return false;
  }
  return true;
}

export async function readPostDataAndValidateCsrfToken(req: Request) {
  const form = await req.formData();
  const csrfToken = form.get(CSRF_TOKEN_INPUT_NAME);
  if (csrfToken === null) {
    throw new Error("Missing CSRF token");
  }
  if (!await isCsrfTokenValid(csrfToken.toString())) {
    throw new Error("Invalid CSRF token");
  }
  return form;
}
