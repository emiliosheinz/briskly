import Link from 'next/link'

import { useMenuOptions } from '../../hooks/use-menu-options'

export function DesktopPrimaryMenu() {
  const menuOptions = useMenuOptions()

  return (
    <div
      data-testid='desktop-primary-menu'
      className='mx-5 hidden gap-6 md:flex lg:mx-10 lg:gap-8'
    >
      {menuOptions.desktop.primary.map(option => (
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
