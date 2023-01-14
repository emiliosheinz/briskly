import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { PlusCircleIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSetAtom } from 'jotai'
import type { GetServerSideProps } from 'next'
import { type NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { z } from 'zod'

import { Button } from '~/components/button'
import { ImageUploader } from '~/components/image-uploader'
import { Input } from '~/components/input'
import { Modal } from '~/components/modal'
import { TextArea } from '~/components/text-area'
import type { WithAuthentication } from '~/types/auth'
import { api, handleApiClientSideError } from '~/utils/api'
import { fullScreenLoaderAtom } from '~/utils/atoms'
import { compress } from '~/utils/image'
import { routes } from '~/utils/navigation'
import { notify } from '~/utils/toast'
import { DeckSchema } from '~/utils/validators/deck'

const NEW_DECK_ID = 'new'

export const getServerSideProps: GetServerSideProps = async context => {
  if (!context.params?.id || context.params?.id !== NEW_DECK_ID) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}

const DeckFormSchema = DeckSchema.pick({
  title: true,
  description: true,
}).extend({
  image: z.custom<FileList>(val => val instanceof FileList && val.length > 0, {
    message: 'A imagem do Deck é obrigatória',
  }),
})

type FormValues = z.infer<typeof DeckFormSchema>

const uploadImageWithoutAwait = (uploadUrl: string, image?: File) => {
  if (!image) return

  fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: image,
  })
}

const DecksCrud: WithAuthentication<NextPage> = () => {
  const setIsLoading = useSetAtom(fullScreenLoaderAtom)
  const router = useRouter()
  const createNewDeckMutation = api.decks.createNewDeck.useMutation()
  const getFileUploadConfigMutation =
    api.files.getFileUploadConfig.useMutation()
  const [isCreatingTopic, setIsCreatingTopic] = useState(false)
  const [topics, setTopics] = useState<Array<string>>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(DeckFormSchema),
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)

    try {
      const [uploadConfig, image] = await Promise.all([
        getFileUploadConfigMutation.mutateAsync(),
        compress(values.image[0]),
      ])

      await createNewDeckMutation.mutateAsync({
        ...values,
        topics,
        image: uploadConfig.fileName,
      })

      uploadImageWithoutAwait(uploadConfig.uploadUrl, image)
      notify.success('Deck criado com sucesso!')
      router.replace(routes.home())
    } catch (error) {
      handleApiClientSideError({ error })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Criar Deck</title>
        <meta
          name='description'
          content='Crie um novo Deck e comece a estudar'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <form className='flex flex-col gap-5' onSubmit={handleSubmit(onSubmit)}>
        <h1 className='text-2xl font-semibold'>Criar Deck</h1>
        <div className='flex w-full flex-col gap-3 sm:flex-row sm:gap-6'>
          <div className='sm:w-[327px]'>
            <ImageUploader
              id='image'
              {...register('image')}
              error={errors['image']?.message as string}
            />
          </div>
          <div className='flex flex-col gap-1 sm:flex-1'>
            <Input
              label='Titulo'
              id='title'
              {...register('title')}
              error={errors['title']?.message as string}
            />
            <TextArea
              label='Descrição'
              id='description'
              rows={8}
              {...register('description')}
              error={errors['description']?.message as string}
            />
          </div>
        </div>
        <h2 className='text-xl font-semibold'>Tópicos</h2>
        <div className='w-full'>
          {topics.map(topic => topic)}
          <Button
            variant='secondary'
            type='button'
            onClick={() => setIsCreatingTopic(true)}
          >
            <PlusCircleIcon className='w-5, h-5' />
          </Button>
        </div>
        <h2 className='text-xl font-semibold'>Cards</h2>
        <div className='h-60 w-full bg-primary-200'></div>
        <h2 className='text-xl font-semibold'>Visibilidade</h2>
        <div className='h-10 w-full bg-primary-200'></div>
        <div className='h-10 w-full bg-primary-200'></div>
        <div className='h-10 w-full bg-primary-200'></div>

        <footer className='flex justify-end gap-5'>
          <Button
            variant='bad'
            type='button'
            onClick={() => router.replace(routes.home())}
          >
            Cancelar
          </Button>
          <Button type='submit'>Salvar</Button>
        </footer>
      </form>
      <Modal.NewTopic
        isOpen={isCreatingTopic}
        setIsOpen={setIsCreatingTopic}
        onSubmit={values => {
          setTopics(topics => [...topics, values.title])
        }}
      />
    </>
  )
}

DecksCrud.requiresAuthentication = true

export default DecksCrud
