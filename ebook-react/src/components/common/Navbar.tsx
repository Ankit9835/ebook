import {
  Navbar as NextUINav,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Badge,
} from "@heroui/react";
import { FC } from "react";
import { FaBookReader } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import ProfileOptions from "../profile/ProfileOptions";

interface Props {}

const Navbar: FC<Props> = () => {
   const { profile,status } = useAuth();
  return (
    <NextUINav>
      <NavbarBrand>
        <Link to="/" className="flex items-center justify-center space-x-2">
          <FaBookReader size={24} />
          <p className="font-bold text-inherit">Store</p>
        </Link>
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem>
          <Link to="/cart">
            <Badge content="0" color="danger" shape="circle">
              <FaCartShopping size={24} />
            </Badge>
          </Link>
        </NavbarItem>
        <NavbarItem>
          <ProfileOptions profile={profile} busy={status === 'busy'} />
        </NavbarItem>
      </NavbarContent>
    </NextUINav>
  );
};

export default Navbar;