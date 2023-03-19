import { BaseModal } from './base/base-modal.component'
import { NewCardModal } from './new-card/new-card-modal.component'
import { NewTopicModal } from './new-topic/new-topic-modal.component'
import { ReportAnswerValidationModal } from './report-answer-validation/report-answer-validation.component'

export const Modal = {
  Base: BaseModal,
  NewTopic: NewTopicModal,
  NewCard: NewCardModal,
  ReportAnswerValidation: ReportAnswerValidationModal,
}
