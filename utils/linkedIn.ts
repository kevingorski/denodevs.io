export interface LinkedInUser {
  /** Subject Identifier (user ID) */
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  /** Member's profile picture URL */
  picture: string;
  locale: string;
  email: string;
  email_verified: boolean;
}

export async function getLinkedInUser(accessToken: string) {
  const response = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error();
  }
  const {
    sub,
  } = await response.json() as LinkedInUser;

  return {
    linkedInId: sub,
  };
}
