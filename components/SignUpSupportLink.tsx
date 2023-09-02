import { upperFirstCase } from "case";
import ContactSupportLink, {
  LinkProps,
} from "@/components/ContactSupportLink.tsx";
import { UserType } from "@/types/UserType.ts";

interface Props extends LinkProps {
  userType: UserType;
}

export default function SignUpSupportLink(
  props: Props,
) {
  const userType = upperFirstCase(props.userType);
  const messageSubject = `${userType} Sign Up Support`;
  const messageBody = `Hello, this is [Your Name Here].
I was trying to sign up with a ${userType} account on DenoDevs, but [Issue Encountered Here].
Please help!`;
  return (
    <ContactSupportLink
      linkText={props.linkText}
      messageSubject={messageSubject}
      messageBody={messageBody}
    />
  );
}
