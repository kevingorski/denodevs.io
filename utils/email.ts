import { Employer, newDeveloperProps, newEmployerProps } from "@/utils/db.ts";
import { Developer } from "@/types/Developer.ts";
import { SITE_NAME } from "@/utils/constants.ts";
import { SITE_BASE_URL } from "@/utils/config.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const shouldSendToConsole = Deno.env.get("SEND_EMAIL_TO_CONSOLE") === "true";
const defaultFromAddress = `${SITE_NAME} <notifications@denodevs.io>`;

export interface EmailMessage {
  from?: string;
  to: string;
  subject: string;
  html: string;
}

export interface TemplateSample {
  name: string;
  message: EmailMessage;
}

export interface HasEmail {
  email: string;
}

export function hasEmail<T extends { email: string | null }>(
  t: T,
): t is T & HasEmail {
  return t.email !== null;
}

type DeveloperWithEmail = Developer & HasEmail;

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

// Welcome Developer

export const renderWelcomeDeveloperEmailMessage = (
  developer: DeveloperWithEmail,
  token: string,
): EmailMessage => ({
  to: developer.email,
  subject: `Welcome to ${SITE_NAME}!`,
  html: `<h1>Welcome to ${SITE_NAME}</h1>
<p>Your account has been created – please <a href="${SITE_BASE_URL}/verifyEmail?token=${token}">click here to confirm your email</a> and get started.</p>
<p>If you are redirected to the sign in page, your verification link has expired and you'll need to sign in with your email to get a new one.
<p>You can always respond to this email if you have any questions.</p>
<p>Thanks,</p>
<p>${SITE_NAME}</p>`,
});

export const sendWelcomeDeveloperEmailMessage = (
  developer: DeveloperWithEmail,
  token: string,
) => sendEmail(renderWelcomeDeveloperEmailMessage(developer, token));

// Developer Email Verification

export const renderDeveloperEmailVerificationMessage = (
  developer: DeveloperWithEmail,
  token: string,
): EmailMessage => ({
  to: developer.email,
  subject: `Please verify your email for ${SITE_NAME}`,
  html:
    `<p>Please <a href="${SITE_BASE_URL}/verifyEmail?token=${token}">click here to confirm your email</a>.</p>
<p>If you are redirected to the sign in page, your verification link has expired and you'll need to sign in with your email to get a new one.
<p>You can always respond to this email if you have any questions.</p>
<p>Thanks,</p>
<p>${SITE_NAME}</p>`,
});

export const sendDeveloperEmailVerificationMessage = (
  developer: DeveloperWithEmail,
  token: string,
) => sendEmail(renderDeveloperEmailVerificationMessage(developer, token));

// Developer Sign In

export const renderDeveloperSignInEmailMessage = (
  developer: DeveloperWithEmail,
  token: string,
): EmailMessage => ({
  to: developer.email,
  subject: `${SITE_NAME} magic link`,
  html:
    `<a href="${SITE_BASE_URL}/developerMagicLink?token=${token}">Click here to sign in</a>.
<p>If you are redirected to the sign in page, your verification link has expired and you'll need to sign in with your email to get a new one.
<p>You can always respond to this email if you have any questions.</p>
<p>Thanks,</p>
<p>${SITE_NAME}</p>`,
});

export const sendDeveloperSignInEmailMessage = (
  developer: DeveloperWithEmail,
  token: string,
) => sendEmail(renderDeveloperSignInEmailMessage(developer, token));

// Welcome Employer

export const renderWelcomeEmployerEmailMessage = (
  employer: Employer,
  token: string,
): EmailMessage => ({
  to: employer.email,
  subject: `${employer.name}, welcome to ${SITE_NAME}!`,
  html: `<h1>Welcome to ${SITE_NAME}</h1>
<p>Your employer account has been created – please <a href="${SITE_BASE_URL}/employerCallback?token=${token}">click here to sign in</a>.
<p>If you are redirected to the sign in page, your verification link has expired and you'll need to sign in with your email to get a new one.
<p>You can always respond to this email if you have any questions.</p>
<p>Thanks,</p>
<p>${SITE_NAME}</p>`,
});

export const sendWelcomeEmployerEmailMessage = (
  employer: Employer,
  token: string,
) => sendEmail(renderWelcomeEmployerEmailMessage(employer, token));

// Employer Sign In

export const renderEmployerSignInEmailMessage = (
  employer: Employer,
  token: string,
): EmailMessage => ({
  to: employer.email,
  subject: `${SITE_NAME} magic link`,
  html:
    `<a href="${SITE_BASE_URL}/employerCallback?token=${token}">Click here to sign in</a>.
<p>If you are redirected to the sign in page, your verification link has expired and you'll need to sign in with your email to get a new one.
<p>You can always respond to this email if you have any questions.</p>
<p>Thanks,</p>
<p>${SITE_NAME}</p>`,
});

export const sendEmployerSignInEmailMessage = (
  employer: Employer,
  token: string,
) => sendEmail(renderEmployerSignInEmailMessage(employer, token));

export function renderTemplateSamples(): TemplateSample[] {
  const developer = {
    ...newDeveloperProps(),
    email: "dev.email@example.com",
  };
  const employer = {
    ...newEmployerProps(),
    company: "Example Co.",
    email: "employer.email@example.com",
    name: "Your New Employer",
  };
  const token = "example-token";
  return [
    {
      name: "Welcome Developer",
      message: renderWelcomeDeveloperEmailMessage(developer, token),
    },
    {
      name: "Developer Email Verification",
      message: renderDeveloperEmailVerificationMessage(developer, token),
    },
    {
      name: "Developer Sign In",
      message: renderDeveloperSignInEmailMessage(developer, token),
    },
    {
      name: "Welcome Employer",
      message: renderWelcomeEmployerEmailMessage(employer, token),
    },
  ];
}
