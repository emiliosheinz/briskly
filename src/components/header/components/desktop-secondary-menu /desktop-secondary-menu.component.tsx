import { Fragment } from 'react'

import { Popover, Transition } from '@headlessui/react'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

import { AuthButton } from '~/components/auth-button'
import { Image } from '~/components/image'

import { useMenuOptions } from '../../hooks/use-menu-options'

export function DesktopSecondaryMenu() {
  const menuOptions = useMenuOptions()
  const { data: session } = useSession()

  const renderImage = () => {
    if (!session?.user?.image) {
      return (
        <UserCircleIcon
          className='h-8 w-8 text-primary-900'
          aria-hidden='true'
        />
      )
    }

    return (
      <Image
        src={session.user.image}
        width={32}
        height={32}
        alt='Imagem de perfil do usuário'
        className='rounded-full ring-1 ring-primary-900'
      />
    )
  }

  return (
    <Popover
      data-testid='desktop-secondary-menu'
      as='div'
      className='relative hidden md:block'
    >
      {({ close }) => (
        <>
          <Popover.Button
            data-testid='popover-button'
            className='inline-flex items-center justify-center bg-primary-50 p-1 text-primary-900'
          >
            {renderImage()}
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
              {menuOptions.desktop.secondary.map(option => (
                <Link
                  href={option.href}
                  key={option.label}
                  onClick={close}
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
        </>
      )}
    </Popover>
  )
}
