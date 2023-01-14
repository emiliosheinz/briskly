import type { Dispatch, SetStateAction } from 'react'

export type BaseModalProps = {
  title: string
  children: React.ReactNode
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}
