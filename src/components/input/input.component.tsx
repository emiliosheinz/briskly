import React from 'react'
import { classNames } from '~/utils/css'
import { InputProps } from './input.types'

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const { label, error, id, disabled, ...otherProps } = props

    const errorClassNames = error
      ? 'border-error-700 focus:border-error-700 focus:ring-error-700'
      : ''

    return (
      <div
        aria-disabled={disabled}
        className={classNames('w-full max-w-xs', disabled ? 'opacity-50' : '')}
      >
        <label
          htmlFor={id}
          className='block text-sm font-medium capitalize text-primary-800'
        >
          {label}
        </label>
        <div className='mt-1 rounded-md shadow-sm'>
          <input
            id={id}
            ref={ref}
            type='text'
            disabled={disabled}
            data-testid='briskly-custom-input'
            className={classNames(
              'block w-full rounded-md border-primary-500 bg-primary-50 pl-6 pr-10 text-base text-primary-900 focus:border-primary-900 focus:ring-primary-900',
              errorClassNames,
            )}
            {...otherProps}
          />
        </div>
        <p className='mt-1 h-5 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-sm capitalize text-error-700'>
          {error}
        </p>
      </div>
    )
  },
)
