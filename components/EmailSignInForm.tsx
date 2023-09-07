import { UserType } from "@/types/UserType.ts";
import SignInHelp from "@/types/SignInHelp.ts";

function SubmittedMessage() {
  return (
    <p>
      Check your email for the sign in link. This link will expire in 10
      minutes.
    </p>
  );
}

export default function SignInForm(
  props: {
    email: string;
    hasSubmitted: boolean;
    signInHelp: SignInHelp | null;
    userType: UserType;
  },
) {
  const { email, hasSubmitted, signInHelp, userType } = props;
  let previousEmail = null;
  switch (userType) {
    case UserType.Developer:
      previousEmail = signInHelp?.developerMaskedEmail;
      break;
    case UserType.Employer:
      previousEmail = signInHelp?.employerMaskedEmail;
      break;
  }
  const placeholder = !previousEmail
    ? "Your email address"
    : `Hint: ${previousEmail}`;
  return (
    <>
      {hasSubmitted ? <SubmittedMessage /> : null}
      <form method="post">
        <label>
          Email:{" "}
          <input
            disabled={hasSubmitted}
            maxLength={255}
            name="email"
            placeholder={placeholder}
            required
            type="email"
            value={email}
          />
        </label>
        <button disabled={hasSubmitted} type="submit">Sign in</button>
      </form>
    </>
  );
}
