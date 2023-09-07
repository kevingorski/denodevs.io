import { Handlers } from "$fresh/server.ts";
import handleDeveloperSignInToken from "@/utils/handleDeveloperSignInToken.ts";

export const handler: Handlers = {
  async GET(req: Request, _) {
    return await handleDeveloperSignInToken(req);
  },
};
