import { ProtectedForm } from "@/utils/csrf.ts";
import { CSRF_TOKEN_INPUT_NAME } from "@/utils/constants.ts";

export function CSRFInput({ csrfToken }: ProtectedForm) {
  return (
    <input type="hidden" name={CSRF_TOKEN_INPUT_NAME} value={csrfToken.uuid} />
  );
}
