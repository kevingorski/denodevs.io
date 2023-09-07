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
  developers = "developers",
  developers_by_email = "developers_by_email",
  developers_by_stripe_customer = "developers_by_stripe_customer",
  developers_created_count = "developers_created_count",
  developers_created_count_by_day = "developers_created_count_by_day",
  employers = "employers",
  employers_by_email = "employers_by_email",
  employers_created_count = "employers_created_count",
  employers_created_count_by_day = "employers_created_count_by_day",
  github_profiles = "github_profiles",
  github_profiles_by_developer = "github_profiles_by_developer",
  sessions = "sessions",
  sign_in_tokens = "sign_in_tokens",
}

export enum AllTimeMetric {
  DevelopersCreatedCount = TopLevelKeys.developers_created_count,
  EmployersCreatedCount = TopLevelKeys.employers_created_count,
}

export type DailyMetric =
  | TopLevelKeys.employers_created_count_by_day
  | TopLevelKeys.developers_created_count_by_day;

enum TokenEntityType {
  admin = "admin",
  developer = "developer",
  employer = "employer",
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

export interface SignInToken {
  entityId: string;
  entityType: TokenEntityType;
  generated: number;
  uuid: string;
}

// deno-lint-ignore no-empty-interface
export interface Session extends SignInToken {}

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

  if (!res.ok) {
    throw new Error(`Failed to create employer with email: ${employer.email}`);
  }
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

export async function deleteEmployer(employer: Employer) {
  const employersKey = [TopLevelKeys.employers, employer.id];
  const employersByEmailKey = [TopLevelKeys.employers_by_email, employer.email];

  const res = await kv.atomic()
    .delete(employersKey)
    .delete(employersByEmailKey)
    .commit();

  if (!res.ok) throw new Error(`Failed to delete employer: ${employer}`);
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

export async function createDeveloperSession(developerId: string) {
  return await createSession(
    TokenEntityType.developer,
    developerId,
    generateExpiringUUID(),
  );
}

export async function upgradeDeveloperOAuthSession(
  developerId: string,
  sessionId: string,
) {
  return await createSession(
    TokenEntityType.developer,
    developerId,
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

export function getDeveloperSession(sessionId: string) {
  return getSession(sessionId, TokenEntityType.developer);
}

export async function deleteAdminSession(sessionId: string) {
  await kv.delete([TopLevelKeys.sessions, TokenEntityType.admin, sessionId]);
}

export async function deleteEmployerSession(sessionId: string) {
  await kv.delete([TopLevelKeys.sessions, TokenEntityType.employer, sessionId]);
}

export async function deleteDeveloperSession(sessionId: string) {
  await kv.delete([
    TopLevelKeys.sessions,
    TokenEntityType.developer,
    sessionId,
  ]);
}

async function createSignInToken(
  entity: Employer | Developer,
  entityType: TokenEntityType,
): Promise<SignInToken> {
  const token = generateExpiringUUID();
  const signInToken = {
    entityId: entity.id,
    entityType,
    ...token,
  };
  const signInTokensKey = [
    TopLevelKeys.sign_in_tokens,
    token.uuid,
  ];
  const res = await kv.set(signInTokensKey, signInToken);
  if (!res.ok) {
    throw new Error(`Failed to create sign in token: ${signInToken}`);
  }
  return signInToken;
}

export function createEmployerSignInToken(
  employer: Employer,
): Promise<SignInToken> {
  return createSignInToken(employer, TokenEntityType.employer);
}

export function createDeveloperSignInToken(
  developer: Developer,
): Promise<SignInToken> {
  return createSignInToken(developer, TokenEntityType.developer);
}

async function getSignInToken(uuid: string) {
  const signInTokensKey = [
    TopLevelKeys.sign_in_tokens,
    uuid,
  ];
  return await getValue<SignInToken>(signInTokensKey, {
    consistency: "eventual",
  }) ?? await getValue<SignInToken>(signInTokensKey);
}

export async function getEmployerSignInToken(uuid: string) {
  const signInToken = await getSignInToken(uuid);
  if (signInToken && signInToken.entityType !== TokenEntityType.employer) {
    return null;
  }
  return signInToken;
}

export async function getDeveloperSignInToken(uuid: string) {
  const signInToken = await getSignInToken(uuid);
  if (signInToken && signInToken.entityType !== TokenEntityType.developer) {
    return null;
  }
  return signInToken;
}

export async function deleteSignInToken(uuid: string) {
  await kv.delete([TopLevelKeys.sign_in_tokens, uuid]);
}

// Developer
interface DeveloperRequiredFields {
  email: string;
  emailConfirmed: boolean;
  id: string;
  isSubscribed: boolean;
}

export interface Developer extends DeveloperRequiredFields {
  bio: string | null;
  company: string | null;
  location: string | null;
  name: string | null;
  stripeCustomerId?: string;
}

export function newDeveloperProps(): Developer {
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
 * Creates a new developer in KV. Throws if the developer already exists.
 *
 * @example
 * ```ts
 * import { createDeveloper, newDeveloperProps } from "@/utils/db.ts";
 *
 * const developer = {
 *   ...newDeveloperProps(),
 *   email: "email",
 * };
 * await createDeveloper(developer);
 * ```
 */
export async function createDeveloper(developer: Developer) {
  const developersKey = [TopLevelKeys.developers, developer.id];
  const developersByEmailKey = [
    TopLevelKeys.developers_by_email,
    developer.email,
  ];
  const developersCreatedCountKey = [
    TopLevelKeys.developers_created_count,
  ];
  const developersCreatedCountByDayKey = [
    TopLevelKeys.developers_created_count_by_day,
    formatDate(new Date()),
  ];

  const atomicOp = kv.atomic();

  if (developer.stripeCustomerId !== undefined) {
    const developersByStripeCustomerKey = [
      TopLevelKeys.developers_by_stripe_customer,
      developer.stripeCustomerId,
    ];
    atomicOp
      .check({ key: developersByStripeCustomerKey, versionstamp: null })
      .set(developersByStripeCustomerKey, developer);
  }

  const res = await atomicOp
    .check({ key: developersKey, versionstamp: null })
    .check({ key: developersByEmailKey, versionstamp: null })
    .set(developersKey, developer)
    .set(developersByEmailKey, developer)
    .sum(developersCreatedCountKey, 1n)
    .sum(developersCreatedCountByDayKey, 1n)
    .commit();

  if (!res.ok) {
    throw new Error(
      `Failed to create developer with email: ${developer.email}`,
    );
  }
}

export async function updateDeveloper(developer: Developer) {
  const developersKey = [TopLevelKeys.developers, developer.id];
  const developersByEmailKey = [
    TopLevelKeys.developers_by_email,
    developer.email,
  ];

  const atomicOp = kv.atomic();

  if (developer.stripeCustomerId !== undefined) {
    const developersByStripeCustomerKey = [
      TopLevelKeys.developers_by_stripe_customer,
      developer.stripeCustomerId,
    ];
    atomicOp
      .set(developersByStripeCustomerKey, developer);
  }

  const res = await atomicOp
    .set(developersKey, developer)
    .set(developersByEmailKey, developer)
    .commit();

  if (!res.ok) throw new Error(`Failed to update developer: ${developer}`);
}

export async function getDeveloper(id: string) {
  return await getValue<Developer>([TopLevelKeys.developers, id]);
}

export async function getDeveloperByEmail(email: string) {
  return await getValue<Developer>([TopLevelKeys.developers_by_email, email]);
}

export async function getDeveloperByStripeCustomer(stripeCustomerId: string) {
  return await getValue<Developer>([
    TopLevelKeys.developers_by_stripe_customer,
    stripeCustomerId,
  ]);
}

export async function getManyDevelopers(ids: string[]) {
  const keys = ids.map((id) => [TopLevelKeys.developers, id]);
  const res = await getManyValues<Developer>(keys);
  return res.filter(Boolean) as Developer[];
}

export interface GitHubProfile {
  developerId: string;
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
  const gitHubProfileByDeveloperKey = [
    TopLevelKeys.github_profiles_by_developer,
    profile.developerId,
  ];
  const res = await kv.atomic()
    .check({ key: gitHubProfileKey, versionstamp: null })
    .check({ key: gitHubProfileByDeveloperKey, versionstamp: null })
    .set(gitHubProfileKey, profile)
    .set(gitHubProfileByDeveloperKey, profile)
    .commit();

  if (!res.ok) throw new Error(`Failed to create GitHub profile: ${profile}`);
}

export async function getGitHubProfile(gitHubId: number) {
  return await getValue<GitHubProfile>([
    TopLevelKeys.github_profiles,
    gitHubId,
  ]);
}

export async function getGitHubProfileByDeveloper(developerId: string) {
  return await getValue<GitHubProfile>([
    TopLevelKeys.github_profiles_by_developer,
    developerId,
  ]);
}

export async function deleteDeveloper(developer: Developer) {
  const developersKey = [TopLevelKeys.developers, developer.id];
  const developersByEmailKey = [
    TopLevelKeys.developers_by_email,
    developer.email,
  ];

  const atomicOp = kv.atomic();

  if (developer.stripeCustomerId !== undefined) {
    const developersByStripeCustomerKey = [
      TopLevelKeys.developers_by_stripe_customer,
      developer.stripeCustomerId,
    ];
    atomicOp.delete(developersByStripeCustomerKey);
  }

  const gitHubProfile = await getGitHubProfileByDeveloper(developer.id);

  if (gitHubProfile) {
    const gitHubProfileKey = [
      TopLevelKeys.github_profiles,
      gitHubProfile.gitHubId,
    ];
    const gitHubProfileByDeveloperKey = [
      TopLevelKeys.github_profiles_by_developer,
      developer.id,
    ];
    atomicOp.delete(gitHubProfileKey);
    atomicOp.delete(gitHubProfileByDeveloperKey);
  }

  const res = await atomicOp
    .delete(developersKey)
    .delete(developersByEmailKey)
    .commit();

  if (!res.ok) throw new Error(`Failed to delete developer: ${developer}`);
}

export async function getManyMetricsForAllTime(
  metrics: AllTimeMetric[],
) {
  const keys = metrics.map((metric) => [metric]);
  const res = await getManyValues<bigint>(keys);
  return res.map((value) => value?.valueOf() ?? 0n);
}

export async function getManyMetricsByDay(
  metric: DailyMetric,
  dates: Date[],
) {
  const keys = dates.map((date) => [metric, formatDate(date)]);
  const res = await getManyValues<bigint>(keys);
  return res.map((value) => value?.valueOf() ?? 0n);
}
