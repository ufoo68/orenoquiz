import { type AppType } from 'next/app'

import { api } from '../utils/api'

import '../styles/globals.css'
import Head from 'next/head'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="maximum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default api.withTRPC(MyApp)
