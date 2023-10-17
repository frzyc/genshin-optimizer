import { PrismaAdapter } from '@auth/prisma-adapter'
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next'
import type { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaClient } from '@prisma/client/gi' // Using the client generated from libs\gi-prisma-schema
import { signJwt } from './jwt'

const prisma = new PrismaClient()

const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID']
const GOOGLE_CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET']
if (!GOOGLE_CLIENT_ID)
  console.error('Environment Variable `GOOGLE_CLIENT_ID` is not defined.')
if (!GOOGLE_CLIENT_SECRET)
  console.error('Environment Variable `GOOGLE_CLIENT_SECRET` is not defined.')

// You'll need to import and pass this
// to `NextAuth` in `app/api/auth/[...nextauth]/route.ts`
export const config = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID ?? '',
      clientSecret: GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token['auth_token'] = signJwt({
          sub: token.sub,
          id_token: account.id_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
        })
      }
      return token
    },
    async session({ session, token }) {
      session.auth_token = token['auth_token'] as string
      session.user.userId = token.sub as string
      return session
    },
  },
  // debug:true
} satisfies NextAuthOptions

// Use in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, config)
}
