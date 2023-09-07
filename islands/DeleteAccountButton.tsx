export default function DeleteAccountButton() {
  const confirmationMessage =
    "Sorry to see you go! After your account is deleted you'll be returned to the sign in page.";

  function handleClick(e: MouseEvent) {
    if (!confirm(confirmationMessage)) {
      e.preventDefault();
    }
  }

  return (
    <button
      onClick={handleClick}
      type="submit"
    >
      Delete Account
    </button>
  );
}
