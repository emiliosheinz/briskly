import type { BaseModalProps } from '../base/base-modal.types'

export type ReportAnswerValidationModalProps = {
  answer: string
  cardId: string
} & Pick<BaseModalProps, 'isOpen' | 'setIsOpen'>