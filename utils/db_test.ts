import {
  createUser,
  deleteUserBySession,
  getManyUsers,
  getUser,
  getUserBySession,
  getUserByStripeCustomer,
  newUserProps,
  updateUser,
  type User,
} from "./db.ts";
import {
  assertArrayIncludes,
  assertEquals,
  assertRejects,
} from "std/testing/asserts.ts";

function genNewUser(): User {
  return {
    email: `${crypto.randomUUID()}@example.com`,
    login: crypto.randomUUID(),
    avatarUrl: `http://${crypto.randomUUID()}`,
    sessionId: crypto.randomUUID(),
    stripeCustomerId: crypto.randomUUID(),
    gravatarId: null,
    name: null,
    company: null,
    location: null,
    bio: null,
    ...newUserProps(),
  };
}

Deno.test("[db] user", async () => {
  const user = genNewUser();

  assertEquals(await getUser(user.email), null);
  assertEquals(await getUserBySession(user.sessionId), null);
  assertEquals(await getUserByStripeCustomer(user.stripeCustomerId!), null);

  await createUser(user);
  await assertRejects(async () => await createUser(user));
  assertEquals(await getUser(user.email), user);
  assertEquals(await getUserBySession(user.sessionId), user);
  assertEquals(await getUserByStripeCustomer(user.stripeCustomerId!), user);

  const user1 = genNewUser();
  await createUser(user1);
  assertArrayIncludes(await getManyUsers([user.email, user1.email]), [
    user,
    user1,
  ]);

  await deleteUserBySession(user.sessionId);
  assertEquals(await getUserBySession(user.sessionId), null);

  const newUser: User = { ...user, sessionId: crypto.randomUUID() };
  await updateUser(newUser);
  assertEquals(await getUser(newUser.email), newUser);
  assertEquals(await getUserBySession(newUser.sessionId), newUser);
  assertEquals(
    await getUserByStripeCustomer(newUser.stripeCustomerId!),
    newUser,
  );
});
