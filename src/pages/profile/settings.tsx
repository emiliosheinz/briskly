import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import isEqual from 'lodash/isEqual'
import type {
  InferGetServerSidePropsType,
  GetServerSideProps,
  NextPage,
} from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import type { z } from 'zod'

import { Button } from '~/components/button'
import { Input } from '~/components/input'
import { TextArea } from '~/components/text-area'
import { Tooltip } from '~/components/tooltip'
import { TopicsForm } from '~/components/topics-form'
import { getServerAuthSession } from '~/server/common/auth'
import { prisma } from '~/server/common/db'
import type { WithAuthentication } from '~/types/auth'
import { api, handleApiClientSideError } from '~/utils/api'
import { routes } from '~/utils/navigation'
import { notify } from '~/utils/toast'
import type { TopicInputSchema } from '~/utils/validators/topic'
import { UpdateUserInputSchema } from '~/utils/validators/user'

async function getUserFromDatabase(useId: string) {
  return await prisma.user.findUnique({
    where: { id: useId },
    select: {
      id: true,
      name: true,
      email: true,
      description: true,
      topics: true,
    },
  })
}

type UserQueryResult = NonNullable<
  Awaited<ReturnType<typeof getUserFromDatabase>>
>

type ProfileSettingsGetServerSidePropsProps = {
  user?: UserQueryResult
}

type ProfileSettingsFormInputValues = {
  name: string
  description: string
}

type TopicInput = z.infer<typeof TopicInputSchema>

export const getServerSideProps: GetServerSideProps<
  ProfileSettingsGetServerSidePropsProps
> = async context => {
  const session = await getServerAuthSession(context)

  if (!session?.user) {
    return {
      props: {},
    }
  }

  const user = await getUserFromDatabase(session.user.id)

  if (!user) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      user,
    },
  }
}

const ProfileSettingsPage: WithAuthentication<
  NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>
> = props => {
  const { user } = props

  const router = useRouter()
  const apiContext = api.useContext()

  const updateUserMutation = api.user.updateUser.useMutation({
    onError: error => {
      handleApiClientSideError({ error })
    },
    onSuccess: () => {
      apiContext.user.getUser.invalidate()
      apiContext.decks.forYou.invalidate()

      notify.success('Perfil atualizado com sucesso!')
      router.push(routes.userProfile(user!.id))
    },
  })

  const { register, handleSubmit, formState, watch } =
    useForm<ProfileSettingsFormInputValues>({
      defaultValues: {
        name: user?.name ?? '',
        description: user?.description ?? '',
      },
      resolver: zodResolver(UpdateUserInputSchema),
      mode: 'onBlur',
    })

  const [topics, setTopics] = useState<Array<TopicInput>>(user?.topics || [])
  const [deletedTopics, setDeletedTopics] = useState<Array<TopicInput>>([])

  if (!user) {
    return null
  }

  const addTopic = (topic: string) => {
    setTopics(topics => [
      ...topics.filter(({ title }) => title !== topic),
      { title: topic.toLowerCase() },
    ])
  }

  const deleteTopic = (idx: number) => {
    const deletedTopic = topics[idx]

    /**
     * If topic has id adds deletedTopic to deletedTopics array
     * We need to do it to delete this topics from the Database later
     */
    if (!!deletedTopic?.id) {
      setDeletedTopics(topics => [...topics, deletedTopic])
    }

    setTopics(topics => [...topics.slice(0, idx), ...topics.slice(idx + 1)])
  }

  const onSubmit = (values: ProfileSettingsFormInputValues) => {
    const { name, description } = values

    updateUserMutation.mutate({
      name,
      description,
      deletedTopics,
      newTopics: topics.filter(({ id }) => !id),
    })
  }

  function renderDisabledEmailInputWithTooltip(email: string) {
    return (
      <Tooltip hint='Seu e-mail não pode ser editado pois você fez login pelo Google.'>
        <div className=' w-full'>
          <Input disabled id='email' label='E-mail' value={email} />
        </div>
      </Tooltip>
    )
  }

  const renderSubmitButtons = () => {
    const [name, description] = watch(['name', 'description'])

    const hasChanges =
      !isEqual(topics, user.topics) ||
      !isEqual(name, user.name) ||
      !isEqual(description, user.description)

    return (
      <div className='mt-5 flex justify-end'>
        <Button
          fullWidth
          disabled={!hasChanges}
          className='block md:hidden'
          isLoading={updateUserMutation.isLoading}
        >
          Salvar
        </Button>
        <Button
          disabled={!hasChanges}
          className='hidden md:block'
          isLoading={updateUserMutation.isLoading}
        >
          Salvar
        </Button>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Configurações da Conta</title>
      </Head>
      <div className='flex flex-col gap-5 '>
        <h1 className='text-2xl font-semibold'>Configurações da Conta</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='flex flex-col gap-0 md:flex-row md:gap-5'>
            <Input
              label='Nome'
              id='name'
              {...register('name')}
              error={formState.errors['name']?.message as string}
            />
            {renderDisabledEmailInputWithTooltip(String(user.email))}
          </div>
          <TextArea
            label='Descrição do Perfil'
            id='description'
            {...register('description')}
            error={formState.errors['description']?.message as string}
          />
          <TopicsForm
            topics={topics}
            onAddTopic={addTopic}
            onDeleteTopic={deleteTopic}
            tooltipText='Visando uma melhor experiência dentro da plataforma, aqui você pode vincular tópicos a sua conta. Estes tópicos serão utilizados para lhe indicar Decks de estudos mais alinhados com os seus interesses.'
          />
          {renderSubmitButtons()}
        </form>
      </div>
    </>
  )
}

ProfileSettingsPage.requiresAuthentication = true

export default ProfileSettingsPage
