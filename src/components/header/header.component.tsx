import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

// TODO emiliosheinz: Create unit tests for Header component
// TODO emiliosheinz: Create Storybook documentation for Header component
export function Header() {
  const { data: sessionData } = useSession()

  const onClick = sessionData ? () => signOut() : () => signIn()
  const label = sessionData ? 'Sign out' : 'Sign in'

  function renderAuthButton() {
    return (
      <button
        className='hover:text-gray-900 whitespace-nowrap text-base font-medium text-primary-900'
        onClick={onClick}
      >
        {label}
      </button>
    )
  }

  return (
    <header className='relative bg-primary-50'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6'>
        <div className='flex items-center justify-between border-b-2 border-primary-200 py-6 md:justify-start md:space-x-10'>
          <div className='flex justify-start lg:w-0 lg:flex-1'>
            <Link href='/'>
              <span className='sr-only'>Briskly</span>
              {/* TODO emiliosheinz: Change image component to use custom component */}
              <Image
                className='h-8 w-auto sm:h-10'
                src='/images/logo.png'
                width={80}
                height={80}
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
