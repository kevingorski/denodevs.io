import { Developer } from "@/types/Developer.ts";
import { SITE_NAME } from "@/utils/constants.ts";
import { useSignal } from "@preact/signals";
import { STATUS_CODE } from "std/http/status.ts";
import { TargetedEvent } from "preact/compat/src/index.js";

type Props = {
  developer: Developer;
};

export default function DeveloperEmailDetails(
  { developer }: Props,
) {
  const isSaving = useSignal(false);
  const email = useSignal(developer.email || "");
  const headerText = useSignal(
    developer.email === null
      ? "Please set your email address"
      : !developer.emailConfirmed
      ? "Please verify your email address"
      : "Email verified!",
  );
  const buttonText = useSignal(
    "Save",
  );
  // TODO: newsletter settings

  function handleInputEmail(e: TargetedEvent<HTMLInputElement>) {
    email.value = e.currentTarget.value;
  }
  async function handleSubmit(e: TargetedEvent<HTMLFormElement>) {
    e.preventDefault();
    isSaving.value = true;
    const res = await fetch("/account/sendVerificationEmail", {
      method: "POST",
      credentials: "same-origin",
      body: JSON.stringify({
        email,
      }),
    });

    if (res.status === STATUS_CODE.Unauthorized) {
      window.location.href = "/signin";
      return;
    }
    if (res.status === STATUS_CODE.NotModified) {
      // Email has already been verified
      window.location.reload();
    }

    buttonText.value = "📬 Email sent! Check your inbox.";
  }
  return (
    <>
      <h2>{headerText.value}</h2>
      <p>
        Without an email, {SITE_NAME}{" "}
        can't contact you when you've been matched to jobs with employers.
      </p>
      <p>
        Please add an email address where you can be reached and click the link
        in the email we send you.
      </p>
      <form
        disabled={isSaving.value}
        onSubmit={handleSubmit}
      >
        <div>
          <label>Email address:</label>
          <input
            autoFocus
            disabled={isSaving.value}
            name="email"
            onInput={handleInputEmail}
            placeholder="Your email address"
            required
            type="email"
            value={email.value}
          />
        </div>
        <button disabled={isSaving.value} type="submit">
          {buttonText.value}
        </button>
      </form>
    </>
  );
}
