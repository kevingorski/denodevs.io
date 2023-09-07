import { Developer, Employer } from "@/utils/db.ts";
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
  developer: Developer,
  token: string,
): EmailMessage => ({
  to: developer.email,
  subject: `${developer.name}, welcome to DenoDevs!`,
  html: `<h1>Welcome to DenoDevs</h1>
<p>Your account has been created...</p>
<p>Please <a href="${SITE_BASE_URL}/verifyEmail?token=${token}">click here to confirm your email</a>.</p>`,
});

export const sendWelcomeDeveloperEmailMessage = (
  developer: Developer,
  token: string,
) => sendEmail(renderWelcomeDevEmailMessage(developer, token));

export const renderDeveloperEmailVerificationMessage = (
  developer: Developer,
  token: string,
): EmailMessage => ({
  to: developer.email,
  subject: `Please verify your email`,
  html:
    `<p>Please <a href="${SITE_BASE_URL}/verifyEmail?token=${token}">click here to confirm your email</a>.</p>`,
});

export const sendDeveloperEmailVerificationMessage = (
  developer: Developer,
  token: string,
) => sendEmail(renderDeveloperEmailVerificationMessage(developer, token));

// TODO: Separate verify email from magic link sign in
export const renderDeveloperSignInEmailMessage = (
  developer: Developer,
  token: string,
): EmailMessage => ({
  to: developer.email,
  subject: `DenoDevs sign in link`,
  html:
    `<a href="${SITE_BASE_URL}/verifyEmail?token=${token}">Click here to sign in</a>.`,
});

export const sendDeveloperSignInEmailMessage = (
  developer: Developer,
  token: string,
) => sendEmail(renderDeveloperSignInEmailMessage(developer, token));

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
