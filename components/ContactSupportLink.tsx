import { SUPPORT_EMAIL_ADDRESS } from "@/utils/constants.ts";

export interface LinkProps {
  linkText?: string;
  titleText?: string;
}

interface Props extends LinkProps {
  messageBody: string;
  messageSubject: string;
}

export default function ContactSupportLink(
  props: Props,
) {
  const linkText = props.linkText ?? "Contact Kevin";
  const messageBody = encodeURIComponent(props.messageBody);
  const messageSubject = encodeURIComponent(props.messageSubject);
  const href =
    `mailto:${SUPPORT_EMAIL_ADDRESS}?subject=${messageSubject}&body=${messageBody}`;
  return (
    <a href={href} target="_blank" title={props.titleText}>
      {linkText}
    </a>
  );
}
