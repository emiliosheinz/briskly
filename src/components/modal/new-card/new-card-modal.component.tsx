import { useMemo } from 'react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/button'
import { TextArea } from '~/components/text-area'
import { withoutPropagation } from '~/utils/forms'
import { CardInputSchema } from '~/utils/validators/card'

import { BaseModal } from '../base/base-modal.component'
import type {
  CardFormInputValues,
  NewCardModalProps,
} from './new-card-modal.types'

export function NewCardModal(props: NewCardModalProps) {
  const { isOpen, setIsOpen, onSubmit, defaultValues } = props

  const { reset, handleSubmit, register, formState } =
    useForm<CardFormInputValues>({
      resolver: zodResolver(CardInputSchema),
      defaultValues: useMemo(() => defaultValues, [defaultValues]),
    })

  useEffect(() => {
    reset(defaultValues)
  }, [reset, defaultValues])

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
    <BaseModal isOpen={isOpen} setIsOpen={setIsOpen} title='Criar Card'>
      <form className='flex flex-col' onSubmit={handleSubmitWithoutPropagation}>
        <TextArea
          id='question'
          label='Pergunta'
          {...register('question')}
          error={formState.errors['question']?.message as string}
        />
        <TextArea
          id='answer'
          label='Resposta'
          {...register('answer')}
          error={formState.errors['answer']?.message as string}
        />
        <div className='flex flex-row justify-end gap-5'>
          <Button type='button' variant='bad' onClick={close}>
            Cancelar
          </Button>
          <Button>Salvar</Button>
        </div>
      </form>
    </BaseModal>
  )
}
