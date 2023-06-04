import React from 'react'

import { XMarkIcon } from '@heroicons/react/24/outline'

import { classNames } from '~/utils/css'

import { Button } from '../button'
import type { PillProps } from './pill.types'

export function _Pill(props: PillProps) {
  const { children, onClick, isDeletable, isDisabled, ...otherProps } = props

  return (
    <Button
      type='button'
      disabled={isDisabled}
      className={classNames(
        'rounded-full ring-1',
        isDeletable ? 'items-center justify-center pr-3' : '',
        onClick ? '' : 'hover:cursor-default enabled:hover:bg-primary-50',
      )}
      variant='secondary'
      onClick={onClick}
      {...otherProps}
    >
      {children}
      {isDeletable ? <XMarkIcon className='w=4 h-4' /> : null}
    </Button>
  )
}

export const Pill = React.memo(_Pill)
