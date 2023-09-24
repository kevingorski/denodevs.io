export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  gravatar_id: string | null;
  name: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  email: string | null;
}

export async function getGitHubUser(accessToken: string) {
  const response = await fetch("https://api.github.com/user", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error();
  }
  const {
    avatar_url,
    gravatar_id,
    id,
    ...rest
  } = await response.json() as GitHubUser;

  return {
    avatarUrl: avatar_url,
    gitHubId: id,
    gravatarId: gravatar_id,
    ...rest,
  };
}
