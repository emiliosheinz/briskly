import { useSession } from 'next-auth/react'
import Link from 'next/link'

import { Image } from '~/components/image'

import { AuthButton } from '../auth-button'
import { DesktopPrimaryMenu } from './components/desktop-primary-menu'
import { DesktopSecondaryMenu } from './components/desktop-secondary-menu '
import { MobileHamburgerMenu } from './components/mobile-hamburger-menu'

export function Header() {
  const { data: session, status } = useSession()

  const isLoadingSession = status === 'loading'

  const renderLogo = () => (
    <Image src='/images/logo.png' width={40} height={35} alt='Briskly logo' />
  )

  const renderDesktopSecondaryMenu = () => {
    if (isLoadingSession) return null

    if (!session) {
      return (
        <div className='hidden w-32 md:block'>
          <AuthButton />
        </div>
      )
    }

    return <DesktopSecondaryMenu />
  }

  return (
    <header className='border-b-2 border-primary-200 bg-primary-50'>
      <div className='mx-auto flex h-20 max-w-7xl items-center justify-between px-3 md:space-x-10 md:px-5'>
        <div className='flex items-center justify-start'>
          <Link href='/' data-testid='home-anchor'>
            <span className='sr-only'>Briskly</span>
            {renderLogo()}
          </Link>
          <DesktopPrimaryMenu />
        </div>
        <MobileHamburgerMenu />
        {renderDesktopSecondaryMenu()}
      </div>
    </header>
  )
}
