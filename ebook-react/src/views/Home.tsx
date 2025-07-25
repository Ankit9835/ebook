import { FC } from "react";
import useAuth from "../hooks/useAuth";

interface Props {}

const Home: FC<Props> = () => {
  const authStatus = useAuth()
  console.log('status',authStatus)
  return <div>Home</div>;
};

export default Home;