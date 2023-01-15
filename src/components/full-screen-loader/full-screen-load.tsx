import { Fragment } from 'react'

import { Transition } from '@headlessui/react'
import { useAtomValue } from 'jotai'

import { fullScreenLoaderAtom } from '~/utils/atoms'

import { Loader } from '../loader'

export function FullScreenLoader() {
  const isLoading = useAtomValue(fullScreenLoaderAtom)

  return (
    <Transition
      as={Fragment}
      enterFrom='opacity-0'
      enterTo='opacity-1'
      leaveFrom='opacity-1'
      leaveTo='opacity-0'
      show={isLoading}
    >
      <div className='fixed top-0 bottom-0 z-50 flex w-full items-center justify-center transition-all'>
        <span className='absolute h-full w-full bg-black-900 opacity-50' />
        <Loader />
      </div>
    </Transition>
  )
}
