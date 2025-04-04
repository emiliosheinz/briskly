import { Fragment } from 'react'

import { Popover, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

import { AuthButton } from '~/components/auth-button'

import { useMenuOptions } from '../../hooks/use-menu-options'

export function MobileHamburgerMenu() {
  const menuOptions = useMenuOptions()

  const renderMenuOptions = ({ close }: { close: () => void }) =>
    menuOptions.mobile.map(option => {
      return (
        <Link
          href={option.href}
          key={option.label}
          className='flex items-center space-x-1 text-primary-900'
          onClick={close}
        >
          <>
            <option.icon className='h-6 w-6' />
            <span>{option.label}</span>
          </>
        </Link>
      )
    })

  return (
    <Popover data-testid='mobile-hamburger-menu' as='div' className='md:hidden'>
      {({ open: isOpen, close }) => {
        const Icon = isOpen ? XMarkIcon : Bars3Icon
        const srOnlyPrefix = isOpen ? 'Close' : 'Open'

        return (
          <>
            <Popover.Button
              data-testid='popover-button'
              className='inline-flex items-center justify-center bg-primary-50 p-1 text-primary-900'
            >
              <span className='sr-only'>{`${srOnlyPrefix} menu`}</span>
              <Icon className='h-8 w-8' aria-hidden='true' />
            </Popover.Button>
            <Transition
              as={Fragment}
              enter='transition ease-out duration-200'
              enterFrom='opacity-0 -translate-y-5'
              enterTo='opacity-100 translate-y-0'
              leave='transition ease-in duration-150'
              leaveFrom='opacity-100 translate-y-0'
              leaveTo='opacity-0 -translate-y-5'
            >
              <Popover.Panel
                data-testid='popover-panel'
                className='absolute inset-x-0 z-30 mt-4 transform bg-primary-50'
              >
                <div className='rounded-3xl px-5 pb-6 pt-5 shadow-lg'>
                  <nav className='flex flex-col items-start justify-start gap-5'>
                    {renderMenuOptions({ close })}
                    <AuthButton />
                  </nav>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )
      }}
    </Popover>
  )
}
