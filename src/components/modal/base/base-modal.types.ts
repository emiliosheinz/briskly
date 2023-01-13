import type { Dispatch, SetStateAction } from 'react'

export type ModalProps = {
  title: string
  children: React.ReactNode
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}
