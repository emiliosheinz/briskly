import { faker } from '@faker-js/faker'
import type { Session } from 'next-auth'
import { SessionContext } from 'next-auth/react'

type AuthState =
  | { data: Session; status: 'authenticated' }
  | { data: null; status: 'unauthenticated' | 'loading' }

type MockedAuthStates = 'loading' | 'unauthenticated' | 'authenticated'

export const AUTH_STATES: Record<MockedAuthStates, AuthState> = {
  loading: {
    data: null,
    status: 'loading',
  },
  unauthenticated: {
    data: null,
    status: 'unauthenticated',
  },
  authenticated: {
    data: {
      user: {
        id: faker.datatype.uuid(),
        name: faker.name.fullName(),
        email: faker.internet.email(),
        image: faker.internet.avatar(),
      },
      expires: faker.date.future().toString(),
    },
    status: 'authenticated',
  },
}

export const withNextAuth = (
  children: React.ReactNode,
  session: keyof typeof AUTH_STATES,
) => {
  return (
    <SessionContext.Provider value={AUTH_STATES[session]}>
      {children}
    </SessionContext.Provider>
  )
}
