import type { Handlers, PageProps, RouteConfig } from "$fresh/server.ts";
import type { AccountState } from "./_middleware.ts";
import { useCSP } from "$fresh/src/runtime/csp.ts";
import {
  createCsrfToken,
  getGitHubProfileByDeveloper,
  getGoogleProfileByDeveloper,
  GitHubProfile,
  GoogleProfile,
  updateDeveloper,
} from "@/utils/db.ts";
import { DeveloperStatus } from "@/types/DeveloperStatus.ts";
import SignOutLink from "@/components/SignOutLink.tsx";
import { UserType } from "@/types/UserType.ts";
import denoDevsCsp from "@/utils/csp.ts";
import { SITE_NAME } from "@/utils/constants.ts";
import DeveloperAccountTabs from "@/islands/DeveloperAccountTabs.tsx";
import {
  ProtectedForm,
  readPostDataAndValidateCsrfToken,
} from "@/utils/csrf.ts";
import { redirect } from "@/utils/redirect.ts";

interface Props extends AccountState, ProtectedForm {
  gitHubProfile: GitHubProfile | null;
  googleProfile: GoogleProfile | null;
}

export const handler: Handlers<Props, AccountState> = {
  async GET(req, ctx) {
    const csrfToken = await createCsrfToken();
    ctx.state.title = "Account";

    const developerId = ctx.state.developer.id;
    const gitHubProfile = await getGitHubProfileByDeveloper(
      developerId,
    );
    const googleProfile = await getGoogleProfileByDeveloper(
      developerId,
    );

    return ctx.render({
      ...ctx.state,
      csrfToken,
      gitHubProfile,
      googleProfile,
    });
  },

  async POST(req, ctx) {
    const form = await readPostDataAndValidateCsrfToken(req);
    const developer = ctx.state.developer;
    const fullNameEntryValue = form.get("fullName");
    const locationEntryValue = form.get("location");
    const countryCodeEntryValue = form.get("countryCode");
    const bioEntryValue = form.get("bio");
    const availableToWorkStartDateEntryValue = form.get(
      "availableToWorkStartDate",
    );
    const openToFullTimeEntryValue = form.get("openToFullTime");
    const openToPartTimeEntryValue = form.get("openToPartTime");
    const openToContractEntryValue = form.get("openToContract");
    const statusEntryValue = form.get("status");

    if (fullNameEntryValue) {
      developer.name = fullNameEntryValue.valueOf().toString();
    }

    if (locationEntryValue) {
      developer.location = locationEntryValue.valueOf().toString();
    }

    if (countryCodeEntryValue) {
      developer.countryCode = countryCodeEntryValue.valueOf().toString();
    }

    if (bioEntryValue) {
      developer.bio = bioEntryValue.valueOf().toString();
    }

    if (availableToWorkStartDateEntryValue) {
      developer.availableToWorkStartDate = availableToWorkStartDateEntryValue
        .valueOf().toString();
    }

    developer.openToFullTime = openToFullTimeEntryValue !== null;
    developer.openToPartTime = openToPartTimeEntryValue !== null;
    developer.openToContract = openToContractEntryValue !== null;

    if (statusEntryValue) {
      developer.status = Number(
        statusEntryValue.valueOf().toString(),
      ) as DeveloperStatus;
    }

    await updateDeveloper(developer);

    // Prevent refresh POSTs, possible side effects of not re-loading Developer
    return redirect("/account");
  },
};

export default function AccountPage(props: PageProps<Props>) {
  useCSP(denoDevsCsp);

  return (
    <main>
      <h1>Welcome to your {SITE_NAME} profile!</h1>
      <DeveloperAccountTabs {...props.data} />
      <SignOutLink userType={UserType.Developer} />
    </main>
  );
}

export const config: RouteConfig = {
  csp: true,
};
