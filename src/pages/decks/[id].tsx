import { useForm } from 'react-hook-form'

import { useSetAtom } from 'jotai'
import type { GetServerSideProps } from 'next'
import { type NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { Button } from '~/components/button'
import { ImageUploader } from '~/components/image-uploader'
import { Input } from '~/components/input'
import { TextArea } from '~/components/text-area'
import type { WithAuthentication } from '~/types/auth'
import { api } from '~/utils/api'
import { fullScreenLoaderAtom } from '~/utils/atoms'
import { routes } from '~/utils/navigation'
import { notify } from '~/utils/toast'

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

type FormValues = {
  title: string
  description: string
  image: FileList
}

const DecksCrud: WithAuthentication<NextPage> = () => {
  const setIsLoading = useSetAtom(fullScreenLoaderAtom)
  const router = useRouter()
  const createNewDeckMutation = api.decks.createNewDeck.useMutation()
  const getFileUploadConfigMutation =
    api.files.getFileUploadConfig.useMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)

    try {
      const uploadConfig = await getFileUploadConfigMutation.mutateAsync()

      const fileUpload = fetch(uploadConfig.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: values.image[0],
      })

      const createDeck = createNewDeckMutation.mutateAsync({
        ...values,
        image: uploadConfig.fileName,
      })

      await Promise.all([fileUpload, createDeck])

      notify.success('Deck criado com sucesso!')
      // TODO emiliosheinz: redirect to deck detail
      router.replace(routes.home())
    } catch {
      notify.error('Erro ao criar o Deck!')
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
              {...register('image', { required: 'Campo obrigatório' })}
              error={errors['image']?.message as string}
            />
          </div>
          <div className='flex flex-col gap-1 sm:flex-1'>
            <Input
              label='Titulo'
              id='title'
              {...register('title', { required: 'Campo obrigatório' })}
              error={errors['title']?.message as string}
            />
            <TextArea
              label='Descrição'
              id='description'
              rows={8}
              {...register('description', { required: 'Campo obrigatório' })}
              error={errors['description']?.message as string}
            />
          </div>
        </div>
        <h2 className='text-xl font-semibold'>Tópicos</h2>
        <div className='h-48 w-full bg-primary-200'></div>
        <h2 className='text-xl font-semibold'>Cards</h2>
        <div className='h-60 w-full bg-primary-200'></div>
        <h2 className='text-xl font-semibold'>Visibilidade</h2>
        <div className='h-10 w-full bg-primary-200'></div>
        <div className='h-10 w-full bg-primary-200'></div>
        <div className='h-10 w-full bg-primary-200'></div>

        <footer className='flex justify-end gap-5'>
          <Button variant='bad' type='button'>
            Cancelar
          </Button>
          <Button type='submit'>Salvar</Button>
        </footer>
      </form>
    </>
  )
}

DecksCrud.requiresAuthentication = true

export default DecksCrud
