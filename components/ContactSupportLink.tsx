export interface LinkProps {
  linkText?: string;
}

interface Props extends LinkProps {
  messageBody: string;
  messageSubject: string;
}

export default function ContactSupportLink(
  props: Props,
) {
  const linkText = props.linkText ?? "contact Kevin";
  const messageBody = encodeURIComponent(props.messageBody);
  const messageSubject = encodeURIComponent(props.messageSubject);
  const href =
    `mailto:kevin@denodevs.io?subject=${messageSubject}&body=${messageBody}`;
  return (
    <a href={href} target="_blank">
      {linkText}
    </a>
  );
}
