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
    }),
  ],
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
