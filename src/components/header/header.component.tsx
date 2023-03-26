import { useEffect, useState } from 'react'

import { Transition } from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useAtom } from 'jotai'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Image } from '~/components/image'
import { isHeaderSearchInputVisibleAtom } from '~/utils/atoms'

import { AuthButton } from '../auth-button'
import { Input } from '../input'
import { DesktopPrimaryMenu } from './components/desktop-primary-menu'
import { DesktopSecondaryMenu } from './components/desktop-secondary-menu '
import { MobileHamburgerMenu } from './components/mobile-hamburger-menu'

export function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isLoadingSession = status === 'loading'

  const [isSearchInputVisible, setIsSearchInputVisible] = useAtom(
    isHeaderSearchInputVisibleAtom,
  )
  const [searchInputValue, setSearchInputValue] = useState('')

  useEffect(() => {
    router.events.on('routeChangeStart', () => {
      setIsSearchInputVisible(false)
    })
  }, [router.events, setIsSearchInputVisible])

  const handleSearchInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'Enter') return
    if (!searchInputValue) return

    router.push(`/search/${searchInputValue.toLowerCase().trim()}`)
  }

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

  const renderSearchButton = () => {
    return (
      <button
        type='button'
        onClick={() => setIsSearchInputVisible(isVisible => !isVisible)}
      >
        <MagnifyingGlassIcon className='h-7 w-7 text-primary-900' />
      </button>
    )
  }

  return (
    <header>
      <div className='border-b-2 border-primary-200 bg-primary-50'>
        <div className='mx-auto flex h-20 max-w-7xl items-center justify-between px-3 md:space-x-10 md:px-5'>
          <div className='flex items-center justify-start'>
            <Link href='/' data-testid='home-anchor'>
              <span className='sr-only'>Briskly</span>
              {renderLogo()}
            </Link>
            <DesktopPrimaryMenu />
          </div>
          <div className='flex gap-5'>
            {renderSearchButton()}
            <MobileHamburgerMenu />
            {renderDesktopSecondaryMenu()}
          </div>
        </div>
      </div>
      <Transition
        show={isSearchInputVisible}
        className='overflow-hidden'
        enter='transition transition-[max-height] duration-500 ease-in'
        enterFrom='transform max-h-0'
        enterTo='transform max-h-screen'
        leave='transition transition-[max-height] duration-250 ease-out'
        leaveFrom='transform max-h-screen'
        leaveTo='transform max-h-0'
      >
        <div className='mx-auto max-w-7xl px-3 pt-4 md:px-5'>
          <Input
            autoFocus
            id='search'
            placeholder='Pesquisar'
            value={searchInputValue}
            onKeyDown={handleSearchInputKeyDown}
            onChange={event => setSearchInputValue(event.target.value)}
          />
        </div>
      </Transition>
    </header>
  )
}
