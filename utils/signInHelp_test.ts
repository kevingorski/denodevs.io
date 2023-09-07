import { assertEquals } from "std/assert/assert_equals.ts";
import { maskEmail } from "@/utils/signInHelp.ts";

Deno.test("[signInHelp] maskEmail()", () => {
  const email = "account@example.com";

  const maskedEmail = maskEmail(email);
  assertEquals(maskedEmail, "a***t@example.com");
});
