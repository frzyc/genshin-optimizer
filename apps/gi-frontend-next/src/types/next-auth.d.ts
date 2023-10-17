import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */

  interface Session extends Sesssion {
    auth_token: string // for jwt

    user: {
      userId: string
    } & DefaultSession['user']
  }
}
