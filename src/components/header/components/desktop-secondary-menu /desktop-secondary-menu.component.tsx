import { Fragment } from 'react'

import { Popover, Transition } from '@headlessui/react'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

import { AuthButton } from '~/components/auth-button'

import { DESKTOP_MENU_OPTIONS } from '../../header.constants'

export function DesktopSecondaryMenu() {
  return (
    <Popover as='div' className='-my-2 -mr-2 hidden md:block'>
      <div>
        <Popover.Button>
          <UserCircleIcon
            className='h-8 w-8 text-primary-900'
            aria-hidden='true'
          />
        </Popover.Button>
      </div>
      <Transition
        as={Fragment}
        enter='transition ease-out duration-100'
        enterFrom='transform opacity-0 scale-95'
        enterTo='transform opacity-100 scale-100'
        leave='transition ease-in duration-75'
        leaveFrom='transform opacity-100 scale-100'
        leaveTo='transform opacity-0 scale-95'
      >
        <Popover.Panel className='absolute right-5 mt-0 flex w-56 origin-top-right flex-col gap-3 rounded-md bg-primary-50 p-4 shadow-lg ring-1 ring-primary-900 ring-opacity-5 focus:outline-none'>
          {DESKTOP_MENU_OPTIONS.SECONDARY.map(option => (
            <Link
              href={option.href}
              key={option.label}
              className='flex items-center space-x-1 whitespace-nowrap'
            >
              {option.label}
            </Link>
          ))}
          <AuthButton />
        </Popover.Panel>
      </Transition>
    </Popover>
  )
}
