import { upperFirstCase } from "case";
import ContactSupportLink from "@/components/ContactSupportLink.tsx";

interface Props {
  accountType: "developer" | "employer";
  existingEmail: string;
  linkText?: string;
}

export default function ExistingEmailSupportLink(
  props: Props,
) {
  const accountType = upperFirstCase(props.accountType);
  const messageSubject = `Existing ${accountType} Email`;
  const messageBody = `Hello, this is [Your Name Here].
I received an existing email error when trying to sign up with a ${accountType} account on DenoDevs with "${props.existingEmail}", but I think this is wrong because [Your Reason Here].
Please help!`;
  return (
    <ContactSupportLink
      linkText={props.linkText}
      messageSubject={messageSubject}
      messageBody={messageBody}
    />
  );
}
