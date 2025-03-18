'use client'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { Button, CardContent } from '@mui/material'
import { login, signup } from './actions'
import { discordOAuth } from './discord'

export default function LoginPage() {
  return (
    <>
      <CardThemed>
        <CardContent>
          <form>
            <label htmlFor="email">Email:</label>
            <input id="email" name="email" type="email" required />
            <label htmlFor="password">Password:</label>
            <input id="password" name="password" type="password" required />
            <button type="button" formAction={login}>
              Log in
            </button>
            <button type="button" formAction={signup}>
              Sign up
            </button>
          </form>
        </CardContent>
      </CardThemed>
      <CardThemed>
        <CardContent>
          <Button onClick={() => discordOAuth()}>Login using Discord</Button>
        </CardContent>
      </CardThemed>
    </>
  )
}
