import type { Dispatch, SetStateAction } from 'react'

export type Option<T> = {
  value: T
  name: string
  description: string
}

export type RadioGroupProps<T> = {
  label: string
  options: Array<Option<T>>
  selected?: Option<T>
  onChange: Dispatch<SetStateAction<Option<T> | undefined>>
}
