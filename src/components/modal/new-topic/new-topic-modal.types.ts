import type { SubmitHandler } from 'react-hook-form'

import { z } from 'zod'

import { TopicInputSchema } from '~/utils/validators/topic'

import type { BaseModalProps } from '../base/base-modal.types'

export const TopicFormInputSchema = z.object({
  title: TopicInputSchema.shape.title,
})
export type TopicFormInputValues = z.infer<typeof TopicFormInputSchema>

export type NewTopicModalProps = Pick<
  BaseModalProps,
  'isOpen' | 'setIsOpen'
> & {
  onSubmit: SubmitHandler<TopicFormInputValues>
}
