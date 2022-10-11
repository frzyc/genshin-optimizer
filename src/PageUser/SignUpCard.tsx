import { LockOutlined } from "@mui/icons-material";
import { Avatar, Box, Button, CardContent, Link, Stack, TextField, Typography } from "@mui/material";
import { Container } from "@mui/system";
import { useContext, useMemo, useState } from "react";
import CardDark from "../Components/Card/CardDark";
import { UserDataContext } from "../Database/UserData";
import { register } from "./auth";
export default function SignUpCard({ toSignin }: { toSignin: () => void }) {
  const [username, setUsername] = useState("frzyc"); // TODO: remove testing
  const [email, setEmail] = useState("123@123.com");// TODO: remove testing
  const [password, setPassword] = useState("123456");// TODO: remove testing
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false)
  const { setUserData } = useContext(UserDataContext)

  const onChangeUsername = (e) => {
    const username = e.target.value;
    setUsername(username);
  };

  const onChangeEmail = (e) => {
    const email = e.target.value;
    setEmail(email);
  };

  const onChangePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
  };

  const handleSignUp = (e) => {
    console.log("HANDLE SIGN UP")
    e.preventDefault();
    register(username, email, password).then(
      res => {
        console.log("LOGIN USER DATA", res.data)
        setUserData(res.data)
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        // setMessage(resMessage);
        // setSuccessful(false);
      }
    )
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
      <Avatar style={{ backgroundColor: '#1bbd7e' }}><LockOutlined /></Avatar>
      <h2>Sign Up</h2>
    </Box>
    <Box component="form"><Stack gap={1}>
      <TextField label='Username' placeholder='Enter username' autoComplete="username" variant="outlined" fullWidth required value={username} onChange={onChangeUsername} error={!!username && !!invalidUserText} helperText={invalidUserText} />
      <TextField label='Email' placeholder='Enter email' type='email' autoComplete="email" variant="outlined" fullWidth required value={email} onChange={onChangeEmail} error={!!email && !isEmailValid} />
      <TextField label='Password' placeholder='Enter password' autoComplete={"new-password"} type='password' variant="outlined" fullWidth required value={password} onChange={onChangePassword} error={!!password && !!invalidPasswordText} helperText={invalidPasswordText} />
      <Button type='submit' color='primary' variant="contained" fullWidth onClick={handleSignUp}>Sign Up</Button>
      <Typography >Do you have an account ?{" "}
        <Link component="button" onClick={toSignin} >Sign In</Link>
      </Typography>
    </Stack></Box>
  </CardContent></CardDark>
  </Container>
}
