import type { SubmitHandler } from 'react-hook-form'

import { z } from 'zod'

import { TopicSchema } from '~/utils/validators/topic'

import type { BaseModalProps } from '../base/base-modal.types'

export const TopicFormSchema = z.object({ title: TopicSchema })
export type TopicFormValues = z.infer<typeof TopicFormSchema>

export type NewTopicModalProps = Pick<
  BaseModalProps,
  'isOpen' | 'setIsOpen'
> & {
  onSubmit: SubmitHandler<TopicFormValues>
}
