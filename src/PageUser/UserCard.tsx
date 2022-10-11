import { AccountCircle, LockOutlined } from "@mui/icons-material";
import { Avatar, Box, Button, CardContent, Checkbox, FormControlLabel, Link, Stack, TextField, Typography } from "@mui/material";
import { Container } from "@mui/system";
import { useContext, useMemo, useState } from "react";
import CardDark from "../Components/Card/CardDark";
import { UserDataContext, userDataInit } from "../Database/UserData";
import useBoolState from "../ReactHooks/useBoolState";
import { register } from "./auth";
export default function UserCard() {
  const [isSignIn, toSignin, toSignUp] = useBoolState(true)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successful, setSuccessful] = useState(false);
  const [message, setMessage] = useState("");
  const { userData: { username, rememberMe }, setUserData } = useContext(UserDataContext)


  const onChangeEmail = (e) => {
    const email = e.target.value;
    setEmail(email);
  };

  const onChangePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
  };

  const handleLogOut = (e) => {
    console.log("HANDLE SIGN UP")
    e.preventDefault();

    setUserData(rememberMe ? { ...userDataInit(), username, rememberMe } : userDataInit())

    // setMessage("");
    // setSuccessful(false);

    // register(username, email, password).then(
    //   (response) => {
    //     console.log(response)
    //     setMessage(response.data.message);
    //     setSuccessful(true);
    //   },
    //   (error) => {
    //     const resMessage =
    //       (error.response &&
    //         error.response.data &&
    //         error.response.data.message) ||
    //       error.message ||
    //       error.toString();

    //     setMessage(resMessage);
    //     setSuccessful(false);
    //   }
    // );

  };
  const handleSignIn = (e) => {
    console.log("HANDLE SIGN IN")
    e.preventDefault();
  }
  const isEmailValid = useMemo(() => !!String(email).toLowerCase().match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  ), [email])

  const invalidUserText = useMemo(() => {
    if (username.length < 3)
      return "Username must be at least 3 characters"
    if (username.length > 50)
      return "Username is too long."
    return ""
  }, [username])

  const invalidPasswordText = useMemo(() => {
    if (password.length < 6)
      return "Password must be at least 6 characters"
    if (password.length > 50)
      return "Password is too long."
    return ""
  }, [password])

  return <Container maxWidth="md" sx={{ py: 2 }}><CardDark><CardContent>
    <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
      <Avatar style={{ backgroundColor: '#1bbd7e' }}><AccountCircle /></Avatar>
      <h2>{username}</h2>
    </Box>
    <Box component="form">
      <Stack gap={1}>
        {!isSignIn && <TextField label='Email' placeholder='Enter email' type='email' variant="outlined" fullWidth required value={email} onChange={onChangeEmail} error={!!email && !isEmailValid} />}
        <TextField label='Password' placeholder='Enter password' type='password' variant="outlined" fullWidth required value={password} onChange={onChangePassword} error={!!password && !!invalidPasswordText} helperText={invalidPasswordText} />
      </Stack>
      <FormControlLabel control={<Checkbox name="checkedB" color="primary" />} label="Remember me" />
    </Box>
    <Button color='error' variant="contained" fullWidth onClick={handleLogOut}>Log Out</Button>
  </CardContent></CardDark>
  </Container>
}
