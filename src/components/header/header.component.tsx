import Link from 'next/link'

import { Image } from '~/components/image'

import { DesktopPrimaryMenu } from './components/desktop-primary-menu'
import { DesktopSecondaryMenu } from './components/desktop-secondary-menu '
import { MobileHamburgerMenu } from './components/mobile-hamburger-menu'

export function Header() {
  const renderLogo = () => (
    <Image src='/images/logo.png' width={40} height={35} alt='Briskly logo' />
  )

  return (
    <header className='border-b-2 border-primary-200 bg-primary-50'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 md:space-x-10'>
        <div className='flex items-center justify-start'>
          <Link href='/'>
            <span className='sr-only'>Briskly</span>
            {renderLogo()}
          </Link>
          <DesktopPrimaryMenu />
        </div>
        <MobileHamburgerMenu />
        <DesktopSecondaryMenu />
      </div>
    </header>
  )
}
