import React from 'react'

import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'

import { classNames } from '~/utils/css'

import type { CardProps } from './card.types'

export function _Card(props: CardProps) {
  const { children, isEditable, onDeletePress, onEditPress, onClick, as } =
    props

  const renderEditButtons = () => {
    if (!isEditable) return null

    return (
      <div className='absolute right-0 top-0 flex gap-2 p-3'>
        <button type='button' onClick={onEditPress}>
          <PencilSquareIcon className='w-5, h-5' />
        </button>
        <button type='button' onClick={onDeletePress}>
          <TrashIcon className='w-5, h-5 text-error-700' />
        </button>
      </div>
    )
  }

  const Container = as || 'div'

  return (
    <Container
      className={classNames(
        'relative flex aspect-video w-96 items-center justify-center rounded-md bg-primary-50 p-5 text-center text-lg text-primary-900 shadow-lg shadow-primary-200 ring-1 ring-primary-900 enabled:hover:bg-primary-100',
        onClick ? 'cursor-pointer' : '',
      )}
      onClick={onClick}
    >
      {children}
      {renderEditButtons()}
    </Container>
  )
}

export const Card = React.memo(_Card)
