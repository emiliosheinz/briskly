import type { SubmitHandler } from 'react-hook-form'

import type { z } from 'zod'

import type { CardInputSchema } from '~/utils/validators/card'

import type { BaseModalProps } from '../base/base-modal.types'

export type CardFormInputValues = z.infer<typeof CardInputSchema>

export type NewCardModalProps = Pick<BaseModalProps, 'isOpen' | 'setIsOpen'> & {
  onSubmit: SubmitHandler<CardFormInputValues>
  defaultValues?: CardFormInputValues
}
