import type { ReactTag } from '@headlessui/react/dist/types'

export type CardProps = {
  children: React.ReactNode
  isEditable?: boolean
  onDeletePress?: () => void
  onEditPress?: () => void
  onClick?: () => void
  as?: ReactTag
  fullWidth?: boolean
}
