'use client'

/**
 * This is the client-side entrypoint for your tRPC API.
 * It's used to create the `api` object which contains typesafe hooks and the
 * React Query provider used throughout the App Router tree.
 */
import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import superjson from 'superjson'

import { type AppRouter } from '../server/api/root'

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export const api = createTRPCReact<AppRouter>()

type TRPCProviderProps = {
  children: ReactNode
}

export const TRPCReactProvider = ({ children }: TRPCProviderProps) => {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    api.createClient({
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    })
  )

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  )
}

export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>
