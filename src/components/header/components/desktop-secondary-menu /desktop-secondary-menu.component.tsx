import { Fragment } from 'react'

import { Popover, Transition } from '@headlessui/react'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

import { AuthButton } from '~/components/auth-button'

import { DESKTOP_MENU_OPTIONS } from '../../header.constants'

export function DesktopSecondaryMenu() {
  return (
    <Popover
      data-testid='desktop-secondary-menu'
      as='div'
      className='relative hidden md:block'
    >
      <Popover.Button
        data-testid='popover-button'
        className='inline-flex items-center justify-center bg-primary-50 p-1 text-primary-900'
      >
        <UserCircleIcon
          className='h-8 w-8 text-primary-900'
          aria-hidden='true'
        />
      </Popover.Button>
      <Transition
        as={Fragment}
        enter='transition ease-out duration-100'
        enterFrom='transform opacity-0 scale-95'
        enterTo='transform opacity-100 scale-100'
        leave='transition ease-in duration-75'
        leaveFrom='transform opacity-100 scale-100'
        leaveTo='transform opacity-0 scale-95'
      >
        <Popover.Panel
          data-testid='popover-panel'
          className='absolute right-0 z-30 mt-0 flex w-60 origin-top-right flex-col gap-3 rounded-md bg-primary-50 p-4 shadow-lg ring-1 ring-primary-900 ring-opacity-5'
        >
          {DESKTOP_MENU_OPTIONS.SECONDARY.map(option => (
            <Link
              href={option.href}
              key={option.label}
              className='flex items-center gap-2 whitespace-nowrap text-primary-900'
            >
              <>
                <option.icon className='h-6 w-6' />
                {option.label}
              </>
            </Link>
          ))}
          <AuthButton />
        </Popover.Panel>
      </Transition>
    </Popover>
  )
}
