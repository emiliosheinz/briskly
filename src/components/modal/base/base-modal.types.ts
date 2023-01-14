import type { Dispatch } from 'react'

export type BaseModalProps = {
  title: string
  children: React.ReactNode
  isOpen: boolean
  setIsOpen: Dispatch<boolean>
}
