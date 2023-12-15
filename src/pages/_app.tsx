import { type AppType } from 'next/app'

import { api } from '../utils/api'

import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'

const MyApp: AppType<{ session: Session }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default api.withTRPC(MyApp)
