import { Fragment } from 'react'

import { Analytics } from '@vercel/analytics/react'
import { Provider as JotaiProvider } from 'jotai'
import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import type { AppType } from 'next/app'

import { AuthGuard } from '~/components/auth-guard'
import { FullScreenLoader } from '~/components/full-screen-loader'
import { Header } from '~/components/header'
import type { WithAuthentication } from '~/types/auth'
import { api } from '~/utils/api'

import '~/styles/tailwind.css'

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
      <FullScreenLoader />
    </JotaiProvider>
  )
}

export default api.withTRPC(MyApp)
