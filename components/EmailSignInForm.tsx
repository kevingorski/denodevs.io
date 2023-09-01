function SubmittedMessage() {
  return (
    <p>
      Check your email for the sign in link. This link will expire in 10
      minutes.
    </p>
  );
}

export default function SignInForm(
  props: { email: string; hasSubmitted: boolean },
) {
  return (
    <>
      {props.hasSubmitted ? <SubmittedMessage /> : null}
      <form method="post">
        <label>
          Email:{" "}
          <input
            disabled={props.hasSubmitted}
            maxLength={255}
            name="email"
            placeholder="Your email address"
            required
            type="email"
            value={props.email}
          />
        </label>
        <button disabled={props.hasSubmitted} type="submit">Sign in</button>
      </form>
    </>
  );
}
