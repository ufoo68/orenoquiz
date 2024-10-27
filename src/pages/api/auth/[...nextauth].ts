import type { NextApiRequest, NextApiResponse } from 'next'
import type { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    session: (params) => {
      const { session, token, user } = params
      return {
        ...session,
        user: {
          ...session.user,
          id: user ? user.id : token.id,
        },
      }
    },
    jwt: (params) => {
      const { token, user } = params
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'guest',
      credentials: {},
      // eslint-disable-next-line @typescript-eslint/require-await
      async authorize() {
        return {
          id: 'guest',
          email: 'guest@example.com',
          name: 'guest',
          image: '',
          provider: 'anonymous',
        }
      },
    }),
  ],
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await NextAuth(req, res, authOptions)
}
