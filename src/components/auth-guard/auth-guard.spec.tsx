import { signIn } from 'next-auth/react'

import { render, screen } from '~/utils/tests/react-testing-library'
import { withNextAuth } from '~/utils/tests/with-next-auth'

import { AuthGuard } from './auth-guard.component'

jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react')

  return {
    ...originalModule,
    signIn: jest.fn(),
    signOut: jest.fn(),
  }
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('AuthGuard Component', () => {
  it('should render loader an not call signIn when useSession is loading', () => {
    render(withNextAuth(<AuthGuard>Children</AuthGuard>, 'loading'))

    const loader = screen.getByTestId('authentication-loader')
    const children = screen.queryByText('Children')

    expect(loader).toBeInTheDocument()
    expect(children).not.toBeInTheDocument()
    expect(signIn).not.toBeCalled()
  })

  it('should render loader and call signIn when useSession has no session', () => {
    render(withNextAuth(<AuthGuard>Children</AuthGuard>, 'unauthenticated'))

    const loader = screen.getByTestId('authentication-loader')
    const children = screen.queryByText('Children')

    expect(loader).toBeInTheDocument()
    expect(children).not.toBeInTheDocument()
    expect(signIn).toBeCalledTimes(1)
  })

  it('should children when not loading and session is present', () => {
    render(withNextAuth(<AuthGuard>Children</AuthGuard>, 'authenticated'))

    const loader = screen.queryByTestId('authentication-loader')
    const children = screen.getByText('Children')

    expect(loader).not.toBeInTheDocument()
    expect(children).toBeInTheDocument()
    expect(signIn).not.toBeCalled()
  })
})
