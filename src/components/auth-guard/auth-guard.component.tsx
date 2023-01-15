import { useEffect } from 'react'

import { signIn, useSession } from 'next-auth/react'

import { Loader } from '../loader'
import type { AuthGuardProps } from './auth-guard.types'

export function AuthGuard(props: AuthGuardProps) {
  const { children } = props

  const { data: session, status } = useSession()

  const isLoading = status === 'loading'

  useEffect(() => {
    if (isLoading) return
    if (!session) signIn()
  }, [isLoading, session])

  if (isLoading || !session) {
    return (
      <div
        data-testid='authentication-loader'
        className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
      >
        <Loader />
      </div>
    )
  }

  return <>{children}</>
}
