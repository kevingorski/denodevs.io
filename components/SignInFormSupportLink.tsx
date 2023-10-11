import { upperFirstCase } from "case";
import ContactSupportLink, {
  LinkProps,
} from "@/components/ContactSupportLink.tsx";
import { UserType } from "@/types/UserType.ts";
import { SITE_NAME } from "@/utils/constants.ts";

interface Props extends LinkProps {
  email?: string;
  userType: UserType;
}

export default function SignInFormSupportLink(
  props: Props,
) {
  const userType = upperFirstCase(props.userType);
  const messageSubject = `${userType} Sign In Support`;
  const emailClause = props.email
    ? ` with the email address "${props.email}"`
    : "";
  const messageBody = `Hello, this is [Your Name Here].
I'm trying to sign in with a ${userType} account on ${SITE_NAME}${emailClause}, but [What's Wrong Here].
Please help!`;
  return (
    <ContactSupportLink
      linkText={props.linkText || "📧 Sign In Help From Kevin"}
      messageSubject={messageSubject}
      messageBody={messageBody}
    />
  );
}
