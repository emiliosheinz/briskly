import { classNames } from '~/utils/css'

import type { ButtonProps, ButtonVariants } from './button.types'

export const variantBasedClassNames: Record<ButtonVariants, string> = {
  primary:
    'bg-primary-900 hover:bg-primary-800 text-primary-50 ring-primary-900',
  secondary:
    'bg-primary-50 hover:bg-primary-100 text-primary-900 ring-primary-900',
  bad: 'bg-primary-50 hover:bg-error-50 text-error-700 ring-error-700',
}

export const fullWidthClassNames = 'w-full justify-center'

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    fullWidth = false,
    children,
    ...otherProps
  } = props

  return (
    <button
      data-testid='briskly-custom-button'
      className={classNames(
        'flex flex-row gap-2 rounded-md px-6 py-2 text-base font-normal capitalize tracking-wide ring-2 transition-colors duration-150 ease-in-out hover:shadow-md',
        variantBasedClassNames[variant],
        fullWidth ? fullWidthClassNames : '',
      )}
      {...otherProps}
    >
      {children}
    </button>
  )
}
