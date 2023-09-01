import { chunk } from "std/collections/chunk.ts";
import { ulid } from "ulid";

const KV_PATH_KEY = "KV_PATH";
let path = undefined;
if (
  (await Deno.permissions.query({ name: "env", variable: KV_PATH_KEY }))
    .state === "granted"
) {
  path = Deno.env.get(KV_PATH_KEY);
}
export const kv = await Deno.openKv(path);

// Helpers
async function getValue<T>(
  key: Deno.KvKey,
  options?: { consistency?: Deno.KvConsistencyLevel },
) {
  const res = await kv.get<T>(key, options);
  return res.value;
}

// deno-lint-ignore no-unused-vars
async function getValues<T>(
  selector: Deno.KvListSelector,
  options?: Deno.KvListOptions,
) {
  const values = [];
  const iter = kv.list<T>(selector, options);
  for await (const { value } of iter) values.push(value);
  return values;
}

/**
 * Gets many values from KV. Uses batched requests to get values in chunks of 10.
 */
async function getManyValues<T>(
  keys: Deno.KvKey[],
): Promise<(T | null)[]> {
  const promises = [];
  for (const batch of chunk(keys, 10)) {
    promises.push(kv.getMany<T[]>(batch));
  }
  return (await Promise.all(promises))
    .flat()
    .map((entry) => entry?.value);
}

/** Converts `Date` to ISO format that is zero UTC offset */
export function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

enum TopLevelKeys {
  employers = "employers",
  employers_by_email = "employers_by_email",
  employers_created_count = "employers_created_count",
  employers_created_count_by_day = "employers_created_count_by_day",
  github_profiles = "github_profiles",
  github_profiles_by_user = "github_profiles_by_user",
  login_tokens = "login_tokens",
  sessions = "sessions",
  users = "users",
  users_by_email = "users_by_email",
  users_by_stripe_customer = "users_by_stripe_customer",
  users_created_count = "users_created_count",
  users_created_count_by_day = "users_created_count_by_day",
}

export type AllTimeMetric =
  | TopLevelKeys.employers_created_count
  | TopLevelKeys.users_created_count;

export type DailyMetric =
  | TopLevelKeys.employers_created_count_by_day
  | TopLevelKeys.users_created_count_by_day;

enum TokenEntityType {
  admin = "admin",
  employer = "employer",
  user = "user",
}

// Employer
export interface Employer {
  id: string;
  email: string;
  emailConfirmed: boolean;
  name: string;
  company: string;
}

export function newEmployerProps(): Pick<
  Employer,
  "id" | "emailConfirmed"
> {
  return {
    id: ulid(),
    emailConfirmed: false,
  };
}

export interface LoginToken {
  entityId: string;
  entityType: TokenEntityType;
  generated: number;
  uuid: string;
}

// deno-lint-ignore no-empty-interface
export interface Session extends LoginToken {}

interface ExpringUUID {
  generated: number;
  uuid: string;
}

function generateExpiringUUID(): ExpringUUID {
  return {
    uuid: crypto.randomUUID(),
    generated: Date.now(),
  };
}

export async function createEmployer(
  employer: Employer,
): Promise<Employer> {
  const employersKey = [TopLevelKeys.employers, employer.id];
  const employersByEmailKey = [TopLevelKeys.employers_by_email, employer.email];
  const employersCreatedCountKey = [
    TopLevelKeys.employers_created_count,
  ];
  const employersCreatedCountByDayKey = [
    TopLevelKeys.employers_created_count_by_day,
    formatDate(new Date()),
  ];

  const atomicOp = kv.atomic();
  const res = await atomicOp
    .check({ key: employersKey, versionstamp: null })
    .check({ key: employersByEmailKey, versionstamp: null })
    .set(employersKey, employer)
    .set(employersByEmailKey, employer)
    .sum(employersCreatedCountKey, 1n)
    .sum(employersCreatedCountByDayKey, 1n)
    .commit();

  if (!res.ok) throw new Error(`Failed to create employer: ${employer}`);
  return employer;
}

export async function updateEmployer(employer: Employer) {
  const employersKey = [TopLevelKeys.employers, employer.id];
  const employersByEmailKey = [TopLevelKeys.employers_by_email, employer.email];

  const res = await kv.atomic()
    .set(employersKey, employer)
    .set(employersByEmailKey, employer)
    .commit();

  if (!res.ok) throw new Error(`Failed to update employer: ${employer}`);
}

export async function getEmployer(id: string) {
  return await getValue<Employer>([TopLevelKeys.employers, id]);
}

export async function getEmployerByEmail(email: string) {
  return await getValue<Employer>([TopLevelKeys.employers_by_email, email]);
}

async function createSession(
  entityType: TokenEntityType,
  entityId: string,
  token: ExpringUUID,
) {
  const session = {
    entityId,
    entityType,
    ...token,
  };
  const sessionsKey = [TopLevelKeys.sessions, entityType, token.uuid];
  const res = await kv.set(sessionsKey, session);
  if (!res.ok) {
    throw new Error(`Failed to create session: ${session}`);
  }
  return session;
}

export async function createAdminSession() {
  return await createSession(
    TokenEntityType.admin,
    "",
    generateExpiringUUID(),
  );
}

export async function createEmployerSession(employerId: string) {
  return await createSession(
    TokenEntityType.employer,
    employerId,
    generateExpiringUUID(),
  );
}

export async function createUserSession(userId: string) {
  return await createSession(
    TokenEntityType.user,
    userId,
    generateExpiringUUID(),
  );
}

export async function upgradeUserOAuthSession(
  userId: string,
  sessionId: string,
) {
  return await createSession(
    TokenEntityType.user,
    userId,
    { generated: Date.now(), uuid: sessionId },
  );
}

async function getSession(sessionId: string, tokenEntityType: TokenEntityType) {
  const sessionsKey = [TopLevelKeys.sessions, tokenEntityType, sessionId];

  return await getValue<Session>(sessionsKey, {
    consistency: "eventual",
  });
}

export function getAdminSession(sessionId: string) {
  return getSession(sessionId, TokenEntityType.admin);
}

export function getEmployerSession(sessionId: string) {
  return getSession(sessionId, TokenEntityType.employer);
}

export function getUserSession(sessionId: string) {
  return getSession(sessionId, TokenEntityType.user);
}

export async function deleteAdminSession(sessionId: string) {
  await kv.delete([TopLevelKeys.sessions, TokenEntityType.admin, sessionId]);
}

export async function deleteEmployerSession(sessionId: string) {
  await kv.delete([TopLevelKeys.sessions, TokenEntityType.employer, sessionId]);
}

export async function deleteUserSession(sessionId: string) {
  await kv.delete([TopLevelKeys.sessions, TokenEntityType.user, sessionId]);
}

async function createLoginToken(
  entity: Employer | User,
  entityType: TokenEntityType,
): Promise<LoginToken> {
  const token = generateExpiringUUID();
  const loginToken = {
    entityId: entity.id,
    entityType,
    ...token,
  };
  const loginTokensKey = [
    TopLevelKeys.login_tokens,
    token.uuid,
  ];
  const res = await kv.set(loginTokensKey, loginToken);
  if (!res.ok) {
    throw new Error(`Failed to create login token: ${loginToken}`);
  }
  return loginToken;
}

export function createEmployerLoginToken(
  employer: Employer,
): Promise<LoginToken> {
  return createLoginToken(employer, TokenEntityType.employer);
}

export function createUserLoginToken(
  user: User,
): Promise<LoginToken> {
  return createLoginToken(user, TokenEntityType.user);
}

async function getLoginToken(uuid: string) {
  const loginTokensKey = [
    TopLevelKeys.login_tokens,
    uuid,
  ];
  return await getValue<LoginToken>(loginTokensKey, {
    consistency: "eventual",
  }) ?? await getValue<LoginToken>(loginTokensKey);
}

export async function getEmployerLoginToken(uuid: string) {
  const loginToken = await getLoginToken(uuid);
  if (loginToken && loginToken.entityType !== TokenEntityType.employer) {
    return null;
  }
  return loginToken;
}

export async function getUserLoginToken(uuid: string) {
  const loginToken = await getLoginToken(uuid);
  if (loginToken && loginToken.entityType !== TokenEntityType.user) {
    return null;
  }
  return loginToken;
}

export async function deleteLoginToken(uuid: string) {
  await kv.delete([TopLevelKeys.login_tokens, uuid]);
}

// User
interface UserRequiredFields {
  email: string;
  emailConfirmed: boolean;
  id: string;
  isSubscribed: boolean;
}

export interface User extends UserRequiredFields {
  bio: string | null;
  company: string | null;
  location: string | null;
  name: string | null;
  stripeCustomerId?: string;
}

export function newUserProps(): User {
  return {
    bio: null,
    company: null,
    email: "",
    emailConfirmed: false,
    id: ulid(),
    isSubscribed: false,
    location: null,
    name: null,
  };
}

/**
 * Creates a new user in KV. Throws if the user already exists.
 *
 * @example
 * ```ts
 * import { createUser, newUser } from "@/utils/db.ts";
 *
 * const user = {
 *   email: "email",
 *   login: "login",
 *   avatarUrl: "https://example.com/avatar-url",
 *   sessionId: "sessionId",
 *   ...newUserProps(),
 * };
 * await createUser(user);
 * ```
 */
export async function createUser(user: User) {
  const usersKey = [TopLevelKeys.users, user.id];
  const usersByEmailKey = [TopLevelKeys.users_by_email, user.email];
  const usersCreatedCountKey = [
    TopLevelKeys.users_created_count,
  ];
  const usersCreatedCountByDayKey = [
    TopLevelKeys.users_created_count_by_day,
    formatDate(new Date()),
  ];

  const atomicOp = kv.atomic();

  if (user.stripeCustomerId !== undefined) {
    const usersByStripeCustomerKey = [
      TopLevelKeys.users_by_stripe_customer,
      user.stripeCustomerId,
    ];
    atomicOp
      .check({ key: usersByStripeCustomerKey, versionstamp: null })
      .set(usersByStripeCustomerKey, user);
  }

  const res = await atomicOp
    .check({ key: usersKey, versionstamp: null })
    .check({ key: usersByEmailKey, versionstamp: null })
    .set(usersKey, user)
    .set(usersByEmailKey, user)
    .sum(usersCreatedCountKey, 1n)
    .sum(usersCreatedCountByDayKey, 1n)
    .commit();

  if (!res.ok) {
    throw new Error(`Failed to create user with email: ${user.email}`);
  }
}

export async function updateUser(user: User) {
  const usersKey = [TopLevelKeys.users, user.id];
  const usersByEmailKey = [TopLevelKeys.users_by_email, user.email];

  const atomicOp = kv.atomic();

  if (user.stripeCustomerId !== undefined) {
    const usersByStripeCustomerKey = [
      TopLevelKeys.users_by_stripe_customer,
      user.stripeCustomerId,
    ];
    atomicOp
      .set(usersByStripeCustomerKey, user);
  }

  const res = await atomicOp
    .set(usersKey, user)
    .set(usersByEmailKey, user)
    .commit();

  if (!res.ok) throw new Error(`Failed to update user: ${user}`);
}

export async function getUser(id: string) {
  return await getValue<User>([TopLevelKeys.users, id]);
}

export async function getUserByEmail(email: string) {
  return await getValue<User>([TopLevelKeys.users_by_email, email]);
}

export async function getUserByStripeCustomer(stripeCustomerId: string) {
  return await getValue<User>([
    TopLevelKeys.users_by_stripe_customer,
    stripeCustomerId,
  ]);
}

export async function getManyUsers(ids: string[]) {
  const keys = ids.map((id) => [TopLevelKeys.users, id]);
  const res = await getManyValues<User>(keys);
  return res.filter(Boolean) as User[];
}

export interface GitHubProfile {
  userId: string;
  gitHubId: number;
  email: string | null;
  login: string;
  avatarUrl: string;
  gravatarId: string | null;
  name: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
}

export async function createGitHubProfile(profile: GitHubProfile) {
  const gitHubProfileKey = [TopLevelKeys.github_profiles, profile.gitHubId];
  const gitHubProfileByUserKey = [
    TopLevelKeys.github_profiles_by_user,
    profile.userId,
  ];
  const res = await kv.atomic()
    .check({ key: gitHubProfileKey, versionstamp: null })
    .check({ key: gitHubProfileByUserKey, versionstamp: null })
    .set(gitHubProfileKey, profile)
    .set(gitHubProfileByUserKey, profile)
    .commit();

  if (!res.ok) throw new Error(`Failed to create GitHub profile: ${profile}`);
}

export async function getGitHubProfile(gitHubId: number) {
  return await getValue<GitHubProfile>([
    TopLevelKeys.github_profiles,
    gitHubId,
  ]);
}

export async function getGitHubProfileByUser(userId: string) {
  return await getValue<GitHubProfile>([
    TopLevelKeys.github_profiles_by_user,
    userId,
  ]);
}

export async function getManyMetricsByDay(
  metric: DailyMetric,
  dates: Date[],
) {
  const keys = dates.map((date) => [metric, formatDate(date)]);
  const res = await getManyValues<bigint>(keys);
  return res.map((value) => value?.valueOf() ?? 0n);
}
