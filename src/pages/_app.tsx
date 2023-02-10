import { Fragment } from 'react'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Analytics } from '@vercel/analytics/react'
import { Provider as JotaiProvider } from 'jotai'
import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import type { AppType } from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'

import { Header } from '~/components/header'
import type { WithAuthentication } from '~/types/auth'
import { api } from '~/utils/api'

import '~/styles/tailwind.css'

const FullScreenLoader = dynamic(() =>
  import('~/components/full-screen-loader').then(
    module => module.FullScreenLoader,
  ),
)
const AuthGuard = dynamic(() =>
  import('~/components/auth-guard').then(module => module.AuthGuard),
)
const Toaster = dynamic(() =>
  import('react-hot-toast').then(module => module.Toaster),
)
/**
 * Needed to infer requiresAuthentication as a prop of Component
 */
type ComponentWithAuthentication<P> = P & {
  Component: WithAuthentication
}

const MyApp: AppType<{ session: Session | null }> = props => {
  const {
    Component,
    pageProps: { session, ...pageProps },
  } = props as ComponentWithAuthentication<typeof props>

  const OptionalAuthGuard = Component.requiresAuthentication
    ? AuthGuard
    : Fragment

  return (
    <JotaiProvider>
      <SessionProvider session={session}>
        <Head>
          <title>Briskly</title>
          <meta name='description' content='The perfect Flashcards app' />
        </Head>
        <Header />
        <main className='min-h-screen w-full bg-primary-50'>
          <div className='m-auto w-full max-w-7xl p-3 md:p-5'>
            <OptionalAuthGuard>
              <Component {...pageProps} />
            </OptionalAuthGuard>
          </div>
        </main>
        <Analytics />
      </SessionProvider>
      <Toaster />
      <FullScreenLoader />
      <ReactQueryDevtools initialIsOpen={false} />
    </JotaiProvider>
  )
}

export default api.withTRPC(MyApp)
