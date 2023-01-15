import type { Key, SVGProps } from 'react'

import { RadioGroup as HeadlessRadioGroup } from '@headlessui/react'

import { classNames } from '~/utils/css'

import type { RadioGroupProps } from './radio-group.types'

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' fill='none' {...props}>
      <circle cx={12} cy={12} r={12} fill='#F8FAFC' opacity='0.2' />
      <path
        d='M7 13l3 3 7-7'
        stroke='#F8FAFC'
        strokeWidth={1.5}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function RadioGroup<T extends Key>(props: RadioGroupProps<T>) {
  const { options, label, selected, onChange } = props

  return (
    <HeadlessRadioGroup value={selected} onChange={onChange}>
      <HeadlessRadioGroup.Label className='text-xl font-semibold'>
        {label}
      </HeadlessRadioGroup.Label>
      <div className='mt-3 space-y-5'>
        {options.map(option => (
          <HeadlessRadioGroup.Option
            key={option.value}
            value={option}
            className={({ active, checked }) =>
              classNames(
                'relative flex cursor-pointer rounded-md px-5 py-4 shadow-md ring-primary-900 focus:outline-none',
                checked ? 'bg-primary-900  text-primary-50' : 'bg-primary-50',
                active
                  ? 'ring-2 ring-opacity-75 ring-offset-2 ring-offset-primary-50   '
                  : 'ring-1',
              )
            }
          >
            {({ checked }) => (
              <>
                <div className='flex w-full items-center justify-between'>
                  <div className='flex items-center'>
                    <div className='text-base'>
                      <HeadlessRadioGroup.Label as='p' className='font-medium'>
                        {option.name}
                      </HeadlessRadioGroup.Label>
                      <HeadlessRadioGroup.Description
                        as='span'
                        className='inline text-sm'
                      >
                        {option.description}
                      </HeadlessRadioGroup.Description>
                    </div>
                  </div>
                  <div
                    className={classNames(
                      'shrink-0 text-primary-900',
                      checked ? 'visible' : 'invisible',
                    )}
                  >
                    <CheckIcon className='h-7 w-7' />
                  </div>
                </div>
              </>
            )}
          </HeadlessRadioGroup.Option>
        ))}
      </div>
    </HeadlessRadioGroup>
  )
}
