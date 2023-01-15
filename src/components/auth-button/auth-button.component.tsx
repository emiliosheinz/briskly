import { signIn, signOut, useSession } from 'next-auth/react'

import { Button } from '../button'

export function AuthButton() {
  const { data: session } = useSession()

  const onClick = session ? () => signOut() : () => signIn()
  const label = session ? 'Sair' : 'Login'
  const sessionBasedVariant = session ? 'bad' : 'secondary'

  return (
    <Button
      fullWidth
      data-testid='auth-button'
      variant={sessionBasedVariant}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}
