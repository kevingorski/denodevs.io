import { SITE_NAME, SITE_VERSION } from "@/utils/constants.ts";

const SITE_TITLE = `${SITE_NAME} ${SITE_VERSION}`;

export default function buildPageTitle(title?: string) {
  return title ? `${title} 🦕💼 ${SITE_TITLE}` : SITE_TITLE;
}
