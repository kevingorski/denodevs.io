const resendApiKey = Deno.env.get("RESEND_API_KEY");
const defaultFromAddress = "DenoDevs <notifications@oi.denodevs.io>";

export interface EmailMessage {
  from?: string;
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = (
  message: EmailMessage,
) => {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: defaultFromAddress, ...message }),
  });
};
