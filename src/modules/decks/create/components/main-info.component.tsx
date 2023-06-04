import { ImageUploader } from '~/components/image-uploader'
import { Input } from '~/components/input'
import { TextArea } from '~/components/text-area'
import { useCreateNewDeckContext } from '~/contexts/create-new-deck'

export const MainInfo = () => {
  const { createNewDeckForm } = useCreateNewDeckContext()

  const { formState, register } = createNewDeckForm ?? {}

  return (
    <>
      <h1 className='text-2xl font-semibold'>Criar Deck</h1>
      <div className='flex w-full flex-col gap-3 sm:flex-row sm:gap-6'>
        <div className='sm:w-[327px]'>
          <ImageUploader
            id='image'
            {...register?.('image')}
            defaultValue={formState?.defaultValues?.image as string}
            error={formState?.errors['image']?.message as string}
          />
        </div>
        <div className='flex flex-col gap-1 sm:flex-1'>
          <Input
            label='Titulo'
            id='title'
            {...register?.('title')}
            error={formState?.errors['title']?.message as string}
            data-testid='deck-name'
          />
          <TextArea
            label='Descrição'
            id='description'
            rows={8}
            {...register?.('description')}
            error={formState?.errors['description']?.message as string}
            data-testid='deck-description'
          />
        </div>
      </div>
    </>
  )
}
