import 'react-tooltip/dist/react-tooltip.css'

import React, { useId } from 'react'
import { Tooltip as ReactTooltip } from 'react-tooltip'

import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

import type { TooltipProps } from './tooltip.types'

function _Tooltip(props: TooltipProps) {
  const { children, hint } = props

  const tooltipId = useId()

  const renderTooltipTrigger = () => {
    if (children) {
      return React.cloneElement(children, {
        id: tooltipId,
      })
    }

    return (
      <span className='inline-block'>
        <QuestionMarkCircleIcon
          className='ml-2 h-5 w-5 text-primary-900 hover:cursor-pointer'
          id={tooltipId}
        />
      </span>
    )
  }

  return (
    <>
      {renderTooltipTrigger()}
      <ReactTooltip
        anchorId={tooltipId}
        className='z-50 max-w-xs'
        variant='dark'
      >
        <p className='text-left text-xs text-primary-50'>{hint}</p>
      </ReactTooltip>
    </>
  )
}

export const Tooltip = React.memo(_Tooltip)
