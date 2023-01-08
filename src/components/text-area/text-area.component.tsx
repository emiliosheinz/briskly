import React from 'react'

import { classNames } from '~/utils/css'

import type { TextAreaProps } from './text-area.types'

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(props, ref) {
    const { label, error, id, disabled, rows = 5, ...otherProps } = props

    const errorClassNames = error
      ? 'border-error-700 focus:border-error-700 focus:ring-error-700'
      : 'border-primary-500 focus:border-primary-900 focus:ring-primary-900'

    return (
      <div
        aria-disabled={disabled}
        className={classNames('w-full', disabled ? 'opacity-50' : '')}
      >
        <label
          htmlFor={id}
          className='block text-sm font-medium capitalize text-primary-800'
        >
          {label}
        </label>
        <div className='mt-1 rounded-md shadow-sm'>
          <textarea
            id={id}
            ref={ref}
            rows={rows}
            disabled={disabled}
            data-testid='briskly-custom-textarea'
            className={classNames(
              'block w-full rounded-md bg-primary-50 pl-6 pr-10 text-base text-primary-900',
              errorClassNames,
            )}
            {...otherProps}
          />
        </div>
        <p className='mt-1 h-5 overflow-hidden text-ellipsis whitespace-nowrap text-sm capitalize text-error-700'>
          {error}
        </p>
      </div>
    )
  },
)