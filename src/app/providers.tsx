'use client'

import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

import { TRPCReactProvider } from '../utils/api'

type ProvidersProps = {
  children: ReactNode
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <SessionProvider>
      <TRPCReactProvider>{children}</TRPCReactProvider>
    </SessionProvider>
  )
}
