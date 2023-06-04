import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/button'
import { Input } from '~/components/input'
import { withoutPropagation } from '~/utils/forms'

import { BaseModal } from '../base/base-modal.component'
import type {
  NewTopicModalProps,
  TopicFormInputValues,
} from './new-topic-modal.types'
import { TopicFormInputSchema } from './new-topic-modal.types'

export function NewTopicModal(props: NewTopicModalProps) {
  const { isOpen, setIsOpen, onSubmit } = props

  const { handleSubmit, reset, formState, register } =
    useForm<TopicFormInputValues>({
      resolver: zodResolver(TopicFormInputSchema),
    })

  const close = () => {
    setIsOpen(false)
    reset()
  }

  const handleSubmitWithoutPropagation = withoutPropagation(
    handleSubmit(values => {
      onSubmit(values)
      close()
    }),
  )

  return (
    <BaseModal isOpen={isOpen} setIsOpen={setIsOpen} title='Criar Tópico'>
      <form className='flex flex-col' onSubmit={handleSubmitWithoutPropagation}>
        <Input
          id='title'
          label='Título'
          {...register('title')}
          error={formState.errors['title']?.message as string}
          data-testid='topic-title-input'
        />
        <div className='flex flex-row justify-end gap-5'>
          <Button type='button' variant='bad' onClick={close}>
            Cancelar
          </Button>
          <Button data-testid='topic-save-button'>Salvar</Button>
        </div>
      </form>
    </BaseModal>
  )
}
