import Link from 'next/link'

import { DESKTOP_MENU_OPTIONS } from '../../header.constants'

export function DesktopPrimaryMenu() {
  return (
    <div
      data-testid='desktop-primary-menu'
      className='mx-5 hidden gap-6 md:flex lg:mx-10 lg:gap-8'
    >
      {DESKTOP_MENU_OPTIONS.PRIMARY.map(option => (
        <Link
          href={option.href}
          key={option.label}
          className='flex items-center space-x-1 whitespace-nowrap text-primary-900'
        >
          {option.label}
        </Link>
      ))}
    </div>
  )
}
