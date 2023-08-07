import { Employer, User } from "@/utils/db.ts";
import { SITE_BASE_URL } from "@/utils/constants.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const shouldSendToConsole = Deno.env.get("SEND_EMAIL_TO_CONSOLE") === "true";
const defaultFromAddress = "DenoDevs <notifications@oi.denodevs.io>";

export interface EmailMessage {
  from?: string;
  to: string;
  subject: string;
  html: string;
}

const sendEmail = (
  message: EmailMessage,
) => {
  if (shouldSendToConsole) {
    console.log(message.html);
    return;
  }
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: defaultFromAddress, ...message }),
  });
};

export const renderWelcomeDevEmailMessage = (
  user: User,
): EmailMessage => ({
  to: user.email,
  subject: `${user.name}, welcome to DenoDevs!`,
  html: `<h1>Welcome to DenoDevs</h1><p>Your account has been created...</p>`,
});

export const sendWelcomeDevEmailMessage = (
  user: User,
) => sendEmail(renderWelcomeDevEmailMessage(user));

export const renderWelcomeEmployerEmailMessage = (
  employer: Employer,
  token: string,
): EmailMessage => ({
  to: employer.email,
  subject: `${employer.name}, welcome to DenoDevs!`,
  html:
    `Yo, <a href="${SITE_BASE_URL}/employerCallback?token=${token}">click here to log in</a>.`,
});

export const sendWelcomeEmployerEmailMessage = (
  employer: Employer,
  token: string,
) => sendEmail(renderWelcomeEmployerEmailMessage(employer, token));

export const renderEmployerLoginEmailMessage = (
  employer: Employer,
  token: string,
): EmailMessage => ({
  to: employer.email,
  subject: `DenoDevs login link`,
  html:
    `${employer.name}, <a href="${SITE_BASE_URL}/employerCallback?token=${token}">click here to log in</a>.`,
});

export const sendEmployerLoginEmailMessage = (
  employer: Employer,
  token: string,
) => sendEmail(renderEmployerLoginEmailMessage(employer, token));

// TODO: set up email rendering admin page
