import { classNames } from '~/utils/css'

import type { ButtonProps, ButtonVariants } from './button.types'

export const variantBasedClassNames: Record<ButtonVariants, string> = {
  primary:
    'bg-primary-900 enabled:hover:bg-primary-800 text-primary-50 ring-primary-900',
  secondary:
    'bg-primary-50 enabled:hover:bg-primary-100 text-primary-900 ring-primary-900',
  bad: 'bg-primary-50 enabled:hover:bg-error-50 text-error-700 ring-error-700',
}

export const fullWidthClassNames = 'w-full justify-center'

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    disabled,
    fullWidth,
    isLoading,
    children,
    ...otherProps
  } = props

  const isDisabled = isLoading || disabled

  const renderLoader = () => {
    if (!isLoading) return null

    const variantBasedBackground: Record<ButtonVariants, string> = {
      primary: 'bg-primary-50',
      secondary: 'bg-primary-900',
      bad: 'bg-error-700',
    }

    return (
      <div
        data-testid='button-loader'
        className='absolute bottom-0 left-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-1 opacity-90'
      >
        <span
          className={classNames(
            'inline-flex h-4 w-4 animate-bounce rounded-full animation-delay-400',
            variantBasedBackground[variant],
          )}
        />
        <span
          className={classNames(
            'inline-flex h-4 w-4 animate-bounce rounded-full animation-delay-200',
            variantBasedBackground[variant],
          )}
        />
        <span
          className={classNames(
            'inline-flex h-4 w-4 animate-bounce rounded-full',
            variantBasedBackground[variant],
          )}
        />
        <span className='sr-only'>Loading...</span>
      </div>
    )
  }

  return (
    <div className='relative'>
      <button
        disabled={isDisabled}
        aria-disabled={isDisabled}
        data-testid='briskly-custom-button'
        className={classNames(
          'flex flex-row gap-2 rounded-md px-6 py-2 text-base font-normal capitalize tracking-wide ring-2 transition-colors duration-150 ease-in-out hover:shadow-md disabled:opacity-50',
          variantBasedClassNames[variant],
          fullWidth ? fullWidthClassNames : '',
        )}
        {...otherProps}
      >
        {children}
      </button>
      {renderLoader()}
    </div>
  )
}
