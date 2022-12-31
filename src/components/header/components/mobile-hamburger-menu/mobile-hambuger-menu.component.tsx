import { Fragment } from 'react'

import { Popover, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

import { AuthButton } from '~/components/auth-button'

import { MOBILE_MENU_OPTIONS } from '../../header.constants'

export function MobileHamburgerMenu() {
  return (
    <Popover as='div' className='-my-2 -mr-2 md:hidden'>
      {({ open: isOpen }) => {
        const Icon = isOpen ? XMarkIcon : Bars3Icon
        const srOnlyPrefix = isOpen ? 'Open' : 'Close'

        return (
          <>
            <Popover.Button className='inline-flex items-center justify-center rounded-md bg-primary-50 p-2 text-primary-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400 '>
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
              <Popover.Panel className='absolute inset-x-0 mt-4 transform bg-primary-50'>
                <div className='rounded-3xl px-5 pt-5 pb-6 shadow-lg '>
                  <nav className='flex flex-col items-start justify-start gap-5'>
                    {MOBILE_MENU_OPTIONS.map(option => (
                      <Link
                        href={option.href}
                        key={option.label}
                        className='flex items-center space-x-1'
                      >
                        <>
                          <option.icon className='h-6 w-6' />
                          <span>{option.label}</span>
                        </>
                      </Link>
                    ))}
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
