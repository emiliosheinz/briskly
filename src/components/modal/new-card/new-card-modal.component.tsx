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
          {...register('validAnswers')}
          error={formState.errors['validAnswers']?.message as string}
          tooltip='Você pode adicionar mais de uma resposta válida separando-as por ponto e vírgula (;) sem nenhum tipo de espaço. Ex.: Resposta 1;Resposta 2;Resposta 3'
          data-testid='card-answer-input'
        />
        <div className='flex flex-row justify-end gap-5'>
          <Button
            type='button'
            variant='bad'
            onClick={close}
            data-testid='close-modal-button'
          >
            Cancelar
          </Button>
          <Button>Salvar</Button>
        </div>
      </form>
    </BaseModal>
  )
}
