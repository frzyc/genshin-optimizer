import { LockOutlined } from "@mui/icons-material";
import { Avatar, Box, Button, CardContent, Checkbox, FormControlLabel, Link, Stack, TextField, Typography } from "@mui/material";
import { Container } from "@mui/system";
import { useContext, useState } from "react";
import CardDark from "../Components/Card/CardDark";
import { UserDataContext } from "../Database/UserData";
import { login } from "./auth";
export default function SignInCard({ toSignup }: { toSignup: () => void }) {
  const { userData: { username: udUsername }, setUserData } = useContext(UserDataContext)
  const [username, setUsername] = useState(udUsername);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false)

  const onChangeUsername = (e) => {
    const username = e.target.value;
    setUsername(username);
  };

  const onChangePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
  };

  const handleSignIn = (e) => {
    console.log("HANDLE SIGN IN")
    e.preventDefault();
    login(username, password).then(
      res => {
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
  }

  return <Container maxWidth="md" sx={{ py: 2 }}><CardDark><CardContent>
    <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
      <Avatar style={{ backgroundColor: '#1bbd7e' }}><LockOutlined /></Avatar>
      <h2>Sign In</h2>
    </Box>
    <Box component="form"><Stack gap={1}>
      <TextField label='Username' placeholder='Enter username' autoComplete="username" variant="outlined" fullWidth required value={username} onChange={onChangeUsername} />
      <TextField label='Password' placeholder='Enter password' autoComplete={"current-password"} type='password' variant="outlined" fullWidth required value={password} onChange={onChangePassword} />
      <FormControlLabel control={<Checkbox name="checkedB" color="primary" value={rememberMe} onChange={e => setRememberMe(e.target.checked)} />} label="Remember me" />
      <Button type='submit' color='primary' variant="contained" fullWidth onClick={handleSignIn}>Sign In</Button>
      <Typography > Do not have an account ?{" "}
        <Link component="button" onClick={toSignup} >
          Sign Up
        </Link>
      </Typography>
    </Stack></Box>
  </CardContent></CardDark>
  </Container>
}
