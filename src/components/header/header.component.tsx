import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

import { Image } from '~/components/image'

// TODO emiliosheinz: Create unit tests for Header component
// TODO emiliosheinz: Create Storybook documentation for Header component
export function Header() {
  const { data: sessionData } = useSession()

  const onClick = sessionData ? () => signOut() : () => signIn()
  const label = sessionData ? 'Sign out' : 'Sign in'

  function renderAuthButton() {
    return (
      <button
        className='whitespace-nowrap text-base font-medium text-primary-900'
        onClick={onClick}
      >
        {label}
      </button>
    )
  }

  return (
    <header className='relative bg-primary-50'>
      <div className='mx-auto max-w-full px-4 sm:px-6'>
        <div className='flex items-center justify-between border-b-2 border-primary-200 py-6 md:justify-start md:space-x-10'>
          <div className='flex justify-start lg:w-0 lg:flex-1'>
            <Link href='/'>
              <span className='sr-only'>Briskly</span>
              {/* TODO emiliosheinz: Change image component to use custom component */}
              <Image
                src='/images/logo.png'
                width={48}
                height={48}
                alt='Briskly logo'
              />
            </Link>
          </div>
          <div className='flex flex-1 items-center justify-end lg:w-0'>
            {renderAuthButton()}
          </div>
        </div>
      </div>
    </header>
  )
}
