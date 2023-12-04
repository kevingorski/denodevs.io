import { Handlers } from "$fresh/server.ts";
import {
  deleteSignInToken,
  getDeveloper,
  getSignInToken,
  updateDeveloper,
} from "@/utils/db.ts";
import { SIGN_IN_TOKEN_LIFETIME_MS } from "@/utils/constants.ts";
import { redirect, redirectToDeveloperSignIn } from "@/utils/redirect.ts";

export const handler: Handlers = {
  async GET(req: Request, _) {
    const requestUrl = new URL(req.url);
    const token = requestUrl.searchParams.get("token");
    if (!token) {
      return new Response(null, {
        status: 400,
      });
    }

    const signInToken = await getSignInToken(token);
    const signInResponse = redirectToDeveloperSignIn();
    if (!signInToken) {
      console.error(`Failed to find developer sign in token: ${token}`);
      return signInResponse;
    }

    await deleteSignInToken(token);

    if ((signInToken.generated + SIGN_IN_TOKEN_LIFETIME_MS) < Date.now()) {
      console.error("Expired developer sign in token");
      return signInResponse;
    }

    const developer = await getDeveloper(signInToken.entityId);
    if (!developer) {
      console.error(`Failed to find developer: ${signInToken.entityId}`);
      return redirectToDeveloperSignIn();
    }
    if (!developer.emailConfirmed) {
      developer.emailConfirmed = true;
      await updateDeveloper(developer);
    }

    return redirect("/account");
  },
};
