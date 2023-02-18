import { Fragment } from 'react'

import { Menu, Transition } from '@headlessui/react'
import {
  EllipsisVerticalIcon,
  PencilSquareIcon,
  RectangleStackIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { useSetAtom } from 'jotai'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import { api, handleApiClientSideError } from '~/utils/api'
import { fullScreenLoaderAtom } from '~/utils/atoms'
import { classNames } from '~/utils/css'
import { routes } from '~/utils/navigation'
import { notify } from '~/utils/toast'

type ActionsDropDownProps = {
  deckOwnerId: string
  className?: string
  deckId: string
}

export const ActionsDropDown = (props: ActionsDropDownProps) => {
  const { deckOwnerId, className, deckId } = props

  const router = useRouter()
  const setIsLoading = useSetAtom(fullScreenLoaderAtom)
  const apiContext = api.useContext()

  const deleteDeckMutation = api.decks.deleteDeck.useMutation({
    onSuccess: () => {
      apiContext.decks.byUser.invalidate()
      apiContext.decks.getPublicDecks.invalidate()
      apiContext.decks.toBeReviewed.invalidate()
    },
  })
  const createStudySessionMutation = api.studySession.create.useMutation({
    onSuccess: () => {
      apiContext.decks.toBeReviewed.invalidate()
      apiContext.studySession.getStudySessionBasicInfo.invalidate({ deckId })
    },
  })

  const { data: session } = useSession()
  const isAuthenticated = !!session?.user
  const isUserDeckOwner = session?.user?.id === deckOwnerId

  const actions = [
    {
      label: 'Editar Deck',
      icon: PencilSquareIcon,
      isEnabled: isAuthenticated && isUserDeckOwner,
      onClick: () => router.push(routes.editDeck(deckId)),
    },
    {
      label: 'Excluir Deck',
      icon: TrashIcon,
      isEnabled: isAuthenticated && isUserDeckOwner,
      onClick: async () => {
        try {
          setIsLoading(true)

          await deleteDeckMutation.mutateAsync({ id: deckId })

          notify.success('Deck excluído com sucesso!')
          router.back()
        } catch (error) {
          handleApiClientSideError({ error })
        } finally {
          setIsLoading(false)
        }
      },
    },
    {
      label: 'Estudar com este Deck',
      icon: RectangleStackIcon,
      isEnabled: isAuthenticated,
      onClick: async () => {
        try {
          setIsLoading(true)

          await createStudySessionMutation.mutateAsync({ deckId })

          notify.success('Sessão de estudo criada com sucesso!')
          router.push(routes.reviewDeck(deckId))
        } catch (error) {
          handleApiClientSideError({ error })
        } finally {
          setIsLoading(false)
        }
      },
    },
  ].filter(({ isEnabled }) => isEnabled)

  if (actions.length === 0) return null

  return (
    <div className={className}>
      <Menu as='div' className='relative inline-block text-left'>
        <div>
          <Menu.Button className='m-2 rounded-sm bg-primary-50'>
            <EllipsisVerticalIcon
              className='hover:text-violet-100 h-8 w-8 text-primary-900'
              aria-hidden='true'
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter='transition ease-out duration-100'
          enterFrom='transform opacity-0 scale-95'
          enterTo='transform opacity-100 scale-100'
          leave='transition ease-in duration-75'
          leaveFrom='transform opacity-100 scale-100'
          leaveTo='transform opacity-0 scale-95'
        >
          <Menu.Items className='absolute right-0 w-56 origin-top-right rounded-md bg-primary-50 shadow-lg ring-1 ring-primary-900 ring-opacity-10 focus:outline-none'>
            <div className='px-1 py-1 '>
              {actions.map(action => (
                <Menu.Item key={action.label}>
                  {({ active }) => (
                    <button
                      onClick={action.onClick}
                      className={classNames(
                        'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm',
                        active
                          ? 'bg-primary-800 text-primary-50'
                          : 'text-primary-900',
                      )}
                    >
                      <action.icon className='h-6 w-6' />
                      <span>{action.label}</span>
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}
