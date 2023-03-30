import type { NextApiRequest, NextApiResponse } from 'next'
import NextAuth from 'next-auth'
import LineProvider from 'next-auth/providers/line'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await NextAuth(req, res, {
    adapter: PrismaAdapter(prisma),
    providers: [
      LineProvider({
        clientId: process.env.LINE_CLIENT_ID ?? '',
        clientSecret: process.env.LINE_CLIENT_SECRET ?? '',
      }),
    ],
  })
}
