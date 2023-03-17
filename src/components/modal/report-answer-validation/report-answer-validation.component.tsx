import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '~/components/button'
import { TextArea } from '~/components/text-area'
import { api } from '~/utils/api'
import { withoutPropagation } from '~/utils/forms'
import { notify } from '~/utils/toast'

import { BaseModal } from '../base/base-modal.component'
import type { ReportAnswerValidationModalProps } from './report-answer-validation.types'

export function ReportAnswerValidationModal(
  props: ReportAnswerValidationModalProps,
) {
  const { isOpen, setIsOpen, answer, cardId } = props

  const { mutate: sendReport } =
    api.answerValidationReports.reportAnswerValidation.useMutation()

  const { handleSubmit, reset, register } = useForm({
    defaultValues: useMemo(() => ({ answer }), [answer]),
  })

  useEffect(() => {
    reset({ answer })
  }, [reset, answer])

  const close = () => {
    setIsOpen(false)
    reset()
  }

  const handleSubmitWithoutPropagation = withoutPropagation(
    handleSubmit(values => {
      sendReport({
        ...values,
        cardId,
      })
      close()

      setTimeout(() => {
        notify.success('Solicitação enviada com sucesso!')
      }, 500)
    }),
  )

  return (
    <BaseModal isOpen={isOpen} setIsOpen={setIsOpen} title='Solicitar revisão'>
      <span>
        Caso você acredite que sua resposta deveria ter sido considerada
        correta, é possível enviar uma solicitação de revisão para o criador do
        Deck submetendo este formulário. Dessa forma, caso a solicitação seja
        aceita, futuras respostas como a sua serão consideradas corretas.
      </span>
      <form
        className='mt-5 flex flex-col'
        onSubmit={handleSubmitWithoutPropagation}
      >
        <TextArea id='answer' label='Resposta' {...register('answer')} />
        <div className='mt-2 flex flex-col justify-end gap-5 md:flex-row'>
          <Button fullWidth type='button' variant='bad' onClick={close}>
            Cancelar
          </Button>
          <Button fullWidth>Enviar Solicitação</Button>
        </div>
      </form>
    </BaseModal>
  )
}
