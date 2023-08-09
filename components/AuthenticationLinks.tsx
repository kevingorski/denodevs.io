export default function AuthenticationLinks(
  props: { employerSessionId?: string; sessionId?: string },
) {
  if (!props.employerSessionId && !props.sessionId) {
    return <a href="/start">Sign in</a>;
  }
  return (
    <>
      {props.employerSessionId && <a href="/employer">Employer</a>}
      {props.sessionId && <a href="/account">Account</a>}
    </>
  );
}
