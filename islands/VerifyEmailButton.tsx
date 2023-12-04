import { useSignal } from "@preact/signals";

export default function VerifyEmailButton(props: { email: string }) {
  const inProgress = useSignal(false);
  const hasSent = useSignal(false);
  const text = useSignal(`Verify Email (${props.email})`);

  async function onClick(event: MouseEvent) {
    inProgress.value = true;

    const res = await fetch("/account/sendVerificationEmail", {
      method: "POST",
      credentials: "same-origin",
    });

    if (res.status === 401) {
      window.location.href = "/signin";
      return;
    }
    hasSent.value = true;
    inProgress.value = false;
    text.value = `📬 Email sent! Check your inbox.`;
  }

  return (
    <button onClick={onClick} disabled={inProgress.value || hasSent.value}>
      {text.value}
    </button>
  );
}
