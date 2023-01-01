import { signIn, signOut } from 'next-auth/react'

import { fireEvent, render, screen } from '~/utils/tests/react-testing-library'
import { withNextAuth } from '~/utils/tests/with-next-auth'

import { AuthButton } from './auth-button.component'

jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react')

  return {
    ...originalModule,
    signIn: jest.fn(),
    signOut: jest.fn(),
  }
})

describe('Auth Button Component', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should be properly rendered', () => {
    const component = render(withNextAuth(<AuthButton />, 'authenticated'))

    expect(component.asFragment()).toMatchSnapshot()
  })

  it('should render Sair when user is authenticated', () => {
    render(withNextAuth(<AuthButton />, 'authenticated'))

    expect(screen.getByText('Sair')).toBeInTheDocument()
  })

  it('should render Login when user is unauthenticated', () => {
    render(withNextAuth(<AuthButton />, 'unauthenticated'))

    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('should render Login when auth status is Loading', () => {
    render(withNextAuth(<AuthButton />, 'loading'))

    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('should call signOut when user is authenticated and button gets pressed', () => {
    render(withNextAuth(<AuthButton />, 'authenticated'))

    const button = screen.getByTestId('auth-button')
    fireEvent.click(button)

    expect(signOut).toHaveBeenCalledTimes(1)
    expect(signIn).toHaveBeenCalledTimes(0)
  })

  it('should call signIn when user is unauthenticated and button gets pressed', () => {
    render(withNextAuth(<AuthButton />, 'unauthenticated'))

    const button = screen.getByTestId('auth-button')
    fireEvent.click(button)

    expect(signOut).toHaveBeenCalledTimes(0)
    expect(signIn).toHaveBeenCalledTimes(1)
  })
})
