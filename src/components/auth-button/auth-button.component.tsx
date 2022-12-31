import { signIn, signOut, useSession } from 'next-auth/react'

export function AuthButton() {
  const { data: session } = useSession()

  const onClick = session ? () => signOut() : () => signIn()
  const label = session ? 'Sair' : 'Login'
  const sessionBasedClassNames = session
    ? 'text-error-700 border-error-700'
    : 'text-primary-900 border-primary-900'

  return (
    <button
      className={`bg-transparent w-full rounded border py-2 px-4 font-semibold ${sessionBasedClassNames}`}
      data-testid='auth-button'
      onClick={onClick}
    >
      {label}
    </button>
  )
}
