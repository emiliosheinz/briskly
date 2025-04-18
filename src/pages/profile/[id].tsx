import { Tab } from '@headlessui/react'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { type NextPage } from 'next'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import Head from 'next/head'

import { Feedback } from '~/components/feedback'
import { Image } from '~/components/image'
import { Pill } from '~/components/pill'
import { profileMenuTabs } from '~/modules/profile/constants/profile-menu-tabs'
import type { WithAuthentication } from '~/types/auth'
import { api } from '~/utils/api'
import { classNames } from '~/utils/css'

const ProfileLoader = dynamic(() =>
  import('~/modules/profile/components/profile-loader.component').then(
    module => module.ProfileLoader,
  ),
)

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

const ProfilePage: WithAuthentication<
  NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>
> = props => {
  const { userId } = props

  const { data: session } = useSession()
  const {
    data: user,
    isLoading,
    isError,
  } = api.user.getUser.useQuery({ id: userId })

  const isUserProfileOwner = userId === session?.user?.id

  const tabs = profileMenuTabs.filter(
    ({ isProfileOwnerOnly }) => isUserProfileOwner || !isProfileOwnerOnly,
  )

  const renderUserImage = () => {
    if (!user?.image) return null

    return (
      <div>
        <Image
          width={112}
          height={112}
          src={user.image}
          className='rounded-full'
          alt={`${user.name} profile image`}
          style={{ objectFit: 'contain' }}
        />
      </div>
    )
  }

  if (isLoading) {
    return <ProfileLoader />
  }

  if (isError) {
    return (
      <Feedback
        title='Opsss,'
        subtitle='Ocorreu um erro ao carregar o perfil do usuário.'
      />
    )
  }

  return (
    <>
      <Head>
        <title>{user?.name || 'Carregando...'}</title>
      </Head>
      <div className='flex flex-col gap-5'>
        <section className='flex flex-col gap-5 md:flex-[2]'>
          <div className='flex flex-row items-center gap-3'>
            {renderUserImage()}
            <div className='flex flex-col items-start'>
              <p className='text-center text-xl text-primary-900 md:text-2xl'>
                {user?.name}
              </p>
              <p className='text-center text-base text-primary-500'>
                {user?.email}
              </p>
            </div>
          </div>
          <p className='text-sm text-primary-900'>{user?.description}</p>
          <ul className='flex flex-wrap gap-3'>
            {user?.topics.map(topic => (
              <li key={topic.id}>
                <Pill>{topic.title}</Pill>
              </li>
            ))}
          </ul>
        </section>

        <section className='flex flex-col md:flex-[8]'>
          <Tab.Group>
            <Tab.List className='flex space-x-1 overflow-x-auto p-1'>
              {tabs.map(tab => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    classNames(
                      'min-w-max border-b-2 px-5 py-2 text-base font-medium leading-5 text-primary-900 ring-primary-50 ring-opacity-60 ring-offset-2 ring-offset-primary-500 focus:outline-none focus:ring-2',
                      selected ? 'border-primary-900' : 'border-primary-50',
                    )
                  }
                >
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className='mt-2'>
              {tabs.map(({ content: Content }, idx) => (
                <Tab.Panel key={idx} className='focus:ring-0'>
                  {({ selected }) => (
                    <Content isVisible={selected} userId={userId} />
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

ProfilePage.requiresAuthentication = true

export default ProfilePage
