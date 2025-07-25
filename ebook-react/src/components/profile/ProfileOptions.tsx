import { Button, Spinner } from "@heroui/react";
import { FC } from "react";
import ProfileMenu from "./ProfileMenu";
import { Link } from "react-router-dom";
import type { Profile } from "../../store/auth";

interface Props {
  busy?: boolean;
  profile?: Profile;
}

const ProfileOptions: FC<Props> = ({ busy, profile }) => {
  if (busy) return <Spinner size="sm" />;

  return profile ? (
    <ProfileMenu profile={profile} />
  ) : (
    <Button as={Link} to="sign-up" variant="bordered">
      Sign Up / In
    </Button>
  );
};

export default ProfileOptions;