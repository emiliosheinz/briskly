import { classNames } from '~/utils/css'

import type { LoaderProps, LoaderVariants } from './loader.types'

export const variantBasedClassName: Record<LoaderVariants, string> = {
  primary: 'bg-primary-50',
  secondary: 'bg-primary-900',
  bad: 'bg-error-700',
}

const animationDelay = [
  'animation-delay-none',
  'animation-delay-150',
  'animation-delay-200',
]

export function Loader(props: LoaderProps) {
  const { variant = 'secondary' } = props

  return (
    <div data-testid='loader' className='flex gap-1 opacity-90'>
      {Array.from({ length: 3 }).map((_, index) => (
        <span
          key={index}
          className={classNames(
            'inline-flex h-3 w-3 animate-bounce rounded-full md:h-4 md:w-4',
            animationDelay[index] || '',
            variantBasedClassName[variant],
          )}
        />
      ))}
      <p className='sr-only'>Loading...</p>
    </div>
  )
}
