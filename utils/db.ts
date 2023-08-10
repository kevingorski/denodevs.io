import { chunk } from "std/collections/chunk.ts";

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
  employers_by_session = "employers_by_session",
  employer_login_tokens = "employer_login_tokens",
  employers_created_count = "employers_created_count",
  employers_created_count_by_day = "employers_created_count_by_day",
  users = "users",
  users_by_session = "users_by_session",
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

// Employer
export interface Employer {
  email: string;
  name: string;
  company: string;
  sessionId: string;
  sessionGenerated: number;
}

export function newEmployerProps(): Pick<
  Employer,
  "sessionId" | "sessionGenerated"
> {
  return generateSessionId();
}

export interface EmployerLoginToken {
  token: string;
  sessionId: string;
  expires: number;
}

function generateSessionId(): { sessionId: string; sessionGenerated: number } {
  return {
    sessionId: crypto.randomUUID(),
    sessionGenerated: Date.now(),
  };
}

export async function createEmployer(
  employer: Employer,
): Promise<Employer> {
  const employersKey = [TopLevelKeys.employers, employer.email];
  const employersBySessionKey = [
    TopLevelKeys.employers_by_session,
    employer.sessionId,
  ];
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
    .check({ key: employersBySessionKey, versionstamp: null })
    .set(employersKey, employer)
    .set(employersBySessionKey, employer)
    .sum(employersCreatedCountKey, 1n)
    .sum(employersCreatedCountByDayKey, 1n)
    .commit();

  if (!res.ok) throw new Error(`Failed to create employer: ${employer}`);
  return employer;
}

export async function getEmployer(email: string) {
  return await getValue<Employer>([TopLevelKeys.employers, email]);
}

export async function updateEmployerSession(employer: Employer) {
  const atomicOp = kv.atomic();
  const updatedEmployer = {
    ...employer,
    ...generateSessionId(),
  };

  const res = await atomicOp
    .set([TopLevelKeys.employers, employer.email], updatedEmployer)
    .set(
      [TopLevelKeys.employers_by_session, employer.sessionId],
      updatedEmployer,
    )
    .commit();

  if (!res.ok) throw new Error(`Failed to update user: ${employer}`);
}

export async function getEmployerBySession(sessionId: string) {
  const employersBySessionKey = [TopLevelKeys.employers_by_session, sessionId];
  return await getValue<Employer>(employersBySessionKey, {
    consistency: "eventual",
  }) ?? await getValue<Employer>(employersBySessionKey);
}

export async function createEmployerLoginToken(
  employer: Employer,
): Promise<EmployerLoginToken> {
  const loginToken = {
    token: crypto.randomUUID(),
    sessionId: employer.sessionId,
    expires: Date.now() + (10 * 60 * 1000),
  };
  const employerLoginTokensKey = [
    TopLevelKeys.employer_login_tokens,
    loginToken.token,
  ];
  const res = await kv.set(employerLoginTokensKey, loginToken);
  if (!res.ok) {
    throw new Error(`Failed to create employer login token: ${loginToken}`);
  }
  return loginToken;
}

export async function getEmployerLoginToken(token: string) {
  const employerLoginTokensKey = [
    TopLevelKeys.employer_login_tokens,
    token,
  ];
  return await getValue<EmployerLoginToken>(employerLoginTokensKey, {
    consistency: "eventual",
  }) ?? await getValue<EmployerLoginToken>(employerLoginTokensKey);
}

export async function deleteEmployerLoginToken(token: string) {
  await kv.delete([TopLevelKeys.employer_login_tokens, token]);
}

// User
export interface User {
  email: string;
  login: string;
  avatarUrl: string;
  gravatarId: string | null;
  name: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  sessionId: string;
  stripeCustomerId?: string;
  // The below properties can be automatically generated upon comment creation
  isSubscribed: boolean;
}

export function newUserProps(): Pick<User, "isSubscribed"> {
  return {
    isSubscribed: false,
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
  const usersKey = [TopLevelKeys.users, user.email];
  const usersBySessionKey = [TopLevelKeys.users_by_session, user.sessionId];
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
    .check({ key: usersBySessionKey, versionstamp: null })
    .set(usersKey, user)
    .set(usersBySessionKey, user)
    .sum(usersCreatedCountKey, 1n)
    .sum(usersCreatedCountByDayKey, 1n)
    .commit();

  if (!res.ok) throw new Error(`Failed to create user: ${user}`);
}

export async function updateUser(user: User) {
  const usersKey = [TopLevelKeys.users, user.email];
  const usersBySessionKey = [TopLevelKeys.users_by_session, user.sessionId];

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
    .set(usersBySessionKey, user)
    .commit();

  if (!res.ok) throw new Error(`Failed to update user: ${user}`);
}

export async function deleteUserBySession(sessionId: string) {
  await kv.delete([TopLevelKeys.users_by_session, sessionId]);
}

export async function getUser(email: string) {
  return await getValue<User>([TopLevelKeys.users, email]);
}

export async function getUserBySession(sessionId: string) {
  const usersBySessionKey = [TopLevelKeys.users_by_session, sessionId];
  return await getValue<User>(usersBySessionKey, {
    consistency: "eventual",
  }) ?? await getValue<User>(usersBySessionKey);
}

export async function getUserByStripeCustomer(stripeCustomerId: string) {
  return await getValue<User>([
    TopLevelKeys.users_by_stripe_customer,
    stripeCustomerId,
  ]);
}

export async function getManyUsers(emails: string[]) {
  const keys = emails.map((email) => [TopLevelKeys.users, email]);
  const res = await getManyValues<User>(keys);
  return res.filter(Boolean) as User[];
}

export async function getManyMetricsByDay(
  metric: DailyMetric,
  dates: Date[],
) {
  const keys = dates.map((date) => [metric, formatDate(date)]);
  const res = await getManyValues<bigint>(keys);
  return res.map((value) => value?.valueOf() ?? 0n);
}
