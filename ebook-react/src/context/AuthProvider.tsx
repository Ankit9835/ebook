import { createContext, FC, ReactNode, useEffect } from "react";
import client from "../api/client";
import { useDispatch, useSelector } from "react-redux";
import { getAuthState, updateAuthStatus, updateProfile, type AuthState } from "../store/auth";


interface Props {
  children: ReactNode;
}

export interface IAuthContext {
  profile: AuthState["profile"];
  status: AuthState["status"];
}

export const AuthContext = createContext<IAuthContext>({
  profile: null,
  status: "authenticated",
});

const AuthProvider: FC<Props> = ({ children }) => {
  const {profile,status} = useSelector(getAuthState)
  const dispatch = useDispatch();

  // const signOut = async() => {
  //   try {
  //     dispatch(updateAuthStatus('busy'))
  //     await client.post('/auth/logout')
  //     dispatch(updateAuthStatus('unauthenticated'))
  //     dispatch(updateProfile(null))
  //   } catch (error) { 
  //     dispatch(updateAuthStatus('unauthenticated'))
  //   }
  // }

  useEffect(() => {
    client.get("/auth/profile").then(({ data }) => {
        //console.log('data',data)
      dispatch(updateProfile(data.profile));
      dispatch(updateAuthStatus('authenticated'))
    });
  }, []);

  return <AuthContext.Provider value={{profile, status}}>{children}</AuthContext.Provider>;
};

export default AuthProvider;