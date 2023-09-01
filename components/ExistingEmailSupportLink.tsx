import { upperFirstCase } from "case";
import ContactSupportLink from "@/components/ContactSupportLink.tsx";
import { UserType } from "@/types/UserType.ts";

interface Props {
  existingEmail: string;
  linkText?: string;
  userType: UserType;
}

export default function ExistingEmailSupportLink(
  props: Props,
) {
  const userType = upperFirstCase(props.userType);
  const messageSubject = `Existing ${userType} Email`;
  const messageBody = `Hello, this is [Your Name Here].
I received an existing email error when trying to sign up with a ${userType} account on DenoDevs with "${props.existingEmail}", but I think this is wrong because [Your Reason Here].
Please help!`;
  return (
    <ContactSupportLink
      linkText={props.linkText}
      messageSubject={messageSubject}
      messageBody={messageBody}
    />
  );
}
