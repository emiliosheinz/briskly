import type { SubmitHandler } from 'react-hook-form'

import type { z } from 'zod'

import type { CardSchema } from '~/utils/validators/card'

import type { BaseModalProps } from '../base/base-modal.types'

export type CardFormValues = z.infer<typeof CardSchema>

export type NewCardModalProps = Pick<BaseModalProps, 'isOpen' | 'setIsOpen'> & {
  onSubmit: SubmitHandler<CardFormValues>
  defaultValues?: CardFormValues
}
