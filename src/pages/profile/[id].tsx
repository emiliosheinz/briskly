import { Tab } from '@headlessui/react'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { type NextPage } from 'next'
import Head from 'next/head'

import { DeckCardList } from '~/components/deck-card-list'
import { Image } from '~/components/image'
import type { WithAuthentication } from '~/types/auth'
import { api } from '~/utils/api'
import { classNames } from '~/utils/css'

export const getServerSideProps: GetServerSideProps<{
  userId: string
}> = async context => {
  const userId = context.params?.id as string

  if (!userId) return { notFound: true }

  return {
    props: {
      userId,
    },
  }
}

type UserDecksProps = {
  userId: string
  isVisible: boolean
}

function UserDecks(props: UserDecksProps) {
  const { userId, isVisible } = props

  const { data, isLoading, isError, refetch } = api.decks.byUser.useQuery(
    { userId: userId },
    { enabled: isVisible },
  )

  if (isLoading) return <DeckCardList.Loading />

  if (isError) {
    return <DeckCardList.Error onRetryPress={refetch} />
  }

  return <DeckCardList decks={data} />
}

const tabs = [
  {
    name: 'Seus Decks',
    content: UserDecks,
  },
  {
    name: 'Para Revisar',
    content: () => {
      return <div>Decks</div>
    },
  },
]

const Profile: WithAuthentication<
  NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>
> = props => {
  const { userId } = props
  const { data: user } = api.user.getUser.useQuery({ id: userId })

  const renderUserImage = () => {
    if (!user?.image) return null

    return (
      <div className='relative h-20 w-20 md:h-64 md:w-64'>
        <Image
          fill
          src={user.image}
          className='rounded-full'
          alt={`${user.name} profile image`}
        />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{user?.name || 'Carregando...'}</title>
      </Head>
      <div className='flex flex-col gap-5 md:flex-row'>
        <section className='flex flex-col gap-3 md:flex-[2]'>
          <div className='flex flex-row items-center gap-3 md:flex-col'>
            {renderUserImage()}
            <div className='flex flex-col items-start md:items-center'>
              <p className='text-center text-xl text-primary-900 md:text-2xl'>
                {user?.name}
              </p>
              <p className='text-center text-base text-primary-500'>
                {user?.email}
              </p>
            </div>
          </div>
          <p className='text-primary-900'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </section>

        <section className='flex flex-col md:flex-[6]'>
          <Tab.Group>
            <Tab.List className='flex space-x-1 p-1'>
              {tabs.map(tab => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    classNames(
                      'border-b-2 py-2 px-5 text-base font-medium leading-5 text-primary-900 ring-primary-50 ring-opacity-60 ring-offset-2 ring-offset-primary-500 focus:outline-none focus:ring-2',
                      selected ? 'border-primary-900' : 'border-primary-50',
                    )
                  }
                >
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className='mt-2'>
              {tabs.map((tab, idx) => (
                <Tab.Panel key={idx} className='focus:ring-0'>
                  {({ selected }) => (
                    <tab.content isVisible={selected} userId={userId} />
                  )}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </section>
      </div>
    </>
  )
}

Profile.requiresAuthentication = true

export default Profile
