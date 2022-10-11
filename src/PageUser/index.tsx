import { Box } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UserData, UserDataContext } from "../Database/UserData";
import useBoolState from "../ReactHooks/useBoolState";
import SignInCard from "./SignInCard";
import SignUpCard from "./SignUpCard";
import UserCard from "./UserCard";

const userDataObj = new UserData()

export default function PageUser() {
  const [isSignIn, toSignin, toSignup] = useBoolState(true)
  // TODO: hoist userData further up the UI.
  const [userData, setUserDataState] = useState(() => userDataObj.data)
  useEffect(() => userDataObj.follow((r, ud) => setUserDataState(ud)), [setUserDataState])
  const setUserData = useCallback((data) => { userDataObj.set(data) }, [userDataObj])
  const userDataContextObj = useMemo(() => ({ userData, setUserData }), [userData, setUserData])
  return <Box>
    <UserDataContext.Provider value={userDataContextObj}>
      {!userData.accessToken && (isSignIn ? <SignInCard toSignup={toSignup} /> : <SignUpCard toSignin={toSignin} />)}
      {!!userData.accessToken && <UserCard />}
      {JSON.stringify(userData, undefined, 2)}
    </UserDataContext.Provider>
  </Box>
}
