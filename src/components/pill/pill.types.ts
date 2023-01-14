import type { ButtonProps } from '../button'

export type PillProps = {
  children: React.ReactNode
  onClick?: ButtonProps['onClick']
  isDeletable?: boolean
  isDisabled?: ButtonProps['disabled']
}
