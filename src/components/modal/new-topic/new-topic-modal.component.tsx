import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/button'
import { Input } from '~/components/input'

import { BaseModal } from '../base/base-modal.component'
import type {
  NewTopicModalProps,
  TopicFormValues,
} from './new-topic-modal.types'
import { TopicFormSchema } from './new-topic-modal.types'

export function NewTopicModal({
  isOpen,
  setIsOpen,
  onSubmit,
}: NewTopicModalProps) {
  const newTopicForm = useForm<TopicFormValues>({
    resolver: zodResolver(TopicFormSchema),
  })

  return (
    <BaseModal isOpen={isOpen} setIsOpen={setIsOpen} title='Criar Tópico'>
      <form
        className='flex flex-col'
        onSubmit={newTopicForm.handleSubmit(values => {
          onSubmit(values)
          setIsOpen(false)
          newTopicForm.reset()
        })}
      >
        <Input
          id='title'
          label='Título*'
          {...newTopicForm.register('title')}
          error={newTopicForm.formState.errors['title']?.message as string}
        />
        <div className='flex flex-row justify-end gap-5'>
          <Button
            type='button'
            variant='bad'
            onClick={() => {
              setIsOpen(false)
              newTopicForm.reset()
            }}
          >
            Cancelar
          </Button>
          <Button>Salvar</Button>
        </div>
      </form>
    </BaseModal>
  )
}
