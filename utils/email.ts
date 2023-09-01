import { Employer, User } from "@/utils/db.ts";
import { SITE_BASE_URL } from "@/utils/constants.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const shouldSendToConsole = Deno.env.get("SEND_EMAIL_TO_CONSOLE") === "true";
const defaultFromAddress = "DenoDevs <notifications@denodevs.io>";

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
    body: JSON.stringify({
      from: defaultFromAddress,
      headers: {
        // Prevents email threading
        "X-Entity-Ref-ID": crypto.randomUUID(),
      },
      ...message,
    }),
  });
};

export const renderWelcomeDevEmailMessage = (
  user: User,
  token: string,
): EmailMessage => ({
  to: user.email,
  subject: `${user.name}, welcome to DenoDevs!`,
  html: `<h1>Welcome to DenoDevs</h1>
<p>Your account has been created...</p>
<p>Please <a href="${SITE_BASE_URL}/verifyEmail?token=${token}">click here to confirm your email</a>.</p>`,
});

export const sendWelcomeDeveloperEmailMessage = (
  user: User,
  token: string,
) => sendEmail(renderWelcomeDevEmailMessage(user, token));

export const renderDeveloperEmailVerificationMessage = (
  user: User,
  token: string,
): EmailMessage => ({
  to: user.email,
  subject: `Please verify your email`,
  html:
    `<p>Please <a href="${SITE_BASE_URL}/verifyEmail?token=${token}">click here to confirm your email</a>.</p>`,
});

export const sendDeveloperEmailVerificationMessage = (
  user: User,
  token: string,
) => sendEmail(renderDeveloperEmailVerificationMessage(user, token));

export const renderDeveloperSignInEmailMessage = (
  user: User,
  token: string,
): EmailMessage => ({
  to: user.email,
  subject: `DenoDevs sign in link`,
  html:
    `<a href="${SITE_BASE_URL}/verifyEmail?token=${token}">Click here to sign in</a>.`,
});

export const sendDeveloperSignInEmailMessage = (
  user: User,
  token: string,
) => sendEmail(renderDeveloperSignInEmailMessage(user, token));

export const renderWelcomeEmployerEmailMessage = (
  employer: Employer,
  token: string,
): EmailMessage => ({
  to: employer.email,
  subject: `${employer.name}, welcome to DenoDevs!`,
  html:
    `Yo, <a href="${SITE_BASE_URL}/employerCallback?token=${token}">click here to sign in</a>.`,
});

export const sendWelcomeEmployerEmailMessage = (
  employer: Employer,
  token: string,
) => sendEmail(renderWelcomeEmployerEmailMessage(employer, token));

export const renderEmployerSignInEmailMessage = (
  employer: Employer,
  token: string,
): EmailMessage => ({
  to: employer.email,
  subject: `DenoDevs sign in link`,
  html:
    `${employer.name}, <a href="${SITE_BASE_URL}/employerCallback?token=${token}">click here to sign in</a>.`,
});

export const sendEmployerSignInEmailMessage = (
  employer: Employer,
  token: string,
) => sendEmail(renderEmployerSignInEmailMessage(employer, token));

// TODO: set up email rendering admin page
