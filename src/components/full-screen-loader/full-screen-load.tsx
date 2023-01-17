import { Fragment } from 'react'

import { Dialog, Transition } from '@headlessui/react'
import { useAtomValue } from 'jotai'
import noop from 'lodash/noop'

import { useDebounce } from '~/hooks/use-debounce'
import { useRouteChangeLoader } from '~/hooks/use-route-change-loader'
import { fullScreenLoaderAtom } from '~/utils/atoms'

import { Loader } from '../loader'

export function FullScreenLoader() {
  const isLoading = useAtomValue(fullScreenLoaderAtom)
  const debouncedIsLoading = useDebounce(isLoading, 350)

  console.log(debouncedIsLoading)

  useRouteChangeLoader()

  return (
    <Transition appear show={debouncedIsLoading} as={Fragment}>
      <Dialog as='div' className='relative z-40' onClose={noop}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-150'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-150'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div
            tabIndex={0}
            className='fixed inset-0 flex items-center justify-center bg-primary-900 bg-opacity-25'
          >
            <Loader />
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}
