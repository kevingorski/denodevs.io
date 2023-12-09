import {
  createDeveloper,
  getDeveloper,
  getManyDevelopers,
  newDeveloperProps,
  updateDeveloper,
} from "./db.ts";
import { type Developer } from "@/types/Developer.ts";
import {
  assertArrayIncludes,
  assertEquals,
  assertRejects,
} from "std/assert/mod.ts";

function genNewDeveloper(): Developer {
  return {
    ...newDeveloperProps(),
    email: `${crypto.randomUUID()}@example.com`,
  };
}

Deno.test("[db] developer", async () => {
  const developer = genNewDeveloper();

  assertEquals(await getDeveloper(developer.id), null);

  await createDeveloper(developer);
  await assertRejects(async () => await createDeveloper(developer));
  assertEquals(await getDeveloper(developer.id), developer);

  const developer1 = genNewDeveloper();
  await createDeveloper(developer1);
  assertArrayIncludes(await getManyDevelopers([developer.id, developer1.id]), [
    developer,
    developer1,
  ]);

  const newDeveloper: Developer = { ...developer };
  await updateDeveloper(newDeveloper);
  assertEquals(await getDeveloper(newDeveloper.id), newDeveloper);
});
