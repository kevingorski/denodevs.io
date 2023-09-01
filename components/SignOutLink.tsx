import { UserType } from "@/types/UserType.ts";

interface Props {
  userType: UserType;
}
export default function SignOutLink(props: Props) {
  const { userType } = props;
  const href = `/signout?type=${userType}`;
  return (
    <a href={href}>
      Sign out
    </a>
  );
}
