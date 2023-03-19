import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { AnswerValidationReport } from '@prisma/client'
import { AnswerValidationReportStatus } from '@prisma/client'

import { api } from '~/utils/api'
import { classNames } from '~/utils/css'
import { notify } from '~/utils/toast'

type UpdateAnswerValidationReportStatusParams = {
  status: AnswerValidationReportStatus
}

type AnswerValidationReportItemProps = {
  report: AnswerValidationReport
  deckId: string
}

const updateSuccessMessages = {
  [AnswerValidationReportStatus.Accepted]:
    'Resposta adicionada a lista de respostas válidas com sucesso',
  [AnswerValidationReportStatus.Rejected]: 'Resposta recusada com sucesso',
}

export function AnswerValidationReportItem(
  props: AnswerValidationReportItemProps,
) {
  const { report, deckId } = props

  const apiContext = api.useContext()

  const { mutate: updateStatus, isLoading } =
    api.answerValidationReports.updateAnswerValidationReportStatus.useMutation({
      onSuccess(_, { status }) {
        const messageKey = status as keyof typeof updateSuccessMessages
        const successMessage = updateSuccessMessages[messageKey]

        if (successMessage) {
          notify.success(successMessage)
        }

        apiContext.answerValidationReports.getCardsWithAnswerValidationReports.setData(
          { deckId },
          data => {
            if (!data) return data

            return {
              ...data,
              cards: data.cards.map(card => {
                if (card.id !== report.cardId) return card

                return {
                  ...card,
                  answerValidationReports: card.answerValidationReports.filter(
                    ({ id }) => id !== report.id,
                  ),
                }
              }),
            }
          },
        )
      },
      onError(error) {
        notify.error(error.message || 'Erro ao atualizar status da resposta')
      },
    })

  const updateAnswerValidationStatus = (
    params: UpdateAnswerValidationReportStatusParams,
  ) => {
    const { status } = params

    updateStatus({ answerValidationReportId: report.id, status })
  }

  return (
    <div className={classNames(isLoading ? 'animate-pulse' : '')}>
      <div
        key={report.id}
        className={classNames(
          'flex items-center justify-between py-3',
          isLoading ? 'opacity-50' : '',
        )}
      >
        <span>{report.answer}</span>
        <div className='flex gap-2'>
          <button
            type='button'
            disabled={isLoading}
            className={classNames(
              'rounded-md p-2 text-primary-900',
              isLoading
                ? 'cursor-default hover:bg-none hover:text-primary-900'
                : 'hover:bg-success-100 hover:text-success-700',
            )}
            onClick={() => {
              updateAnswerValidationStatus({
                status: AnswerValidationReportStatus.Accepted,
              })
            }}
          >
            <CheckIcon className='h-5 w-5' />
          </button>
          <button
            type='button'
            disabled={isLoading}
            className={classNames(
              'rounded-md p-2 text-primary-900 ',
              isLoading
                ? 'cursor-default hover:bg-none hover:text-primary-900'
                : 'hover:bg-error-100 hover:text-error-700',
            )}
            onClick={() => {
              updateAnswerValidationStatus({
                status: AnswerValidationReportStatus.Rejected,
              })
            }}
          >
            <XMarkIcon className='h-5 w-5' />
          </button>
        </div>
      </div>
    </div>
  )
}
