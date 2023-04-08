import type { BaseModalProps } from '../base/base-modal.types'

export type ReportAnswerValidationModalProps = {
  answer: string
  cardId: string
  onReportSuccess: (reportedCardId: string) => void
} & Pick<BaseModalProps, 'isOpen' | 'setIsOpen'>
