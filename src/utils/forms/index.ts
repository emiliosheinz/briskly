import type { FormEvent } from 'react'

export const withoutPropagation =
  (cb: (e: React.BaseSyntheticEvent) => Promise<void>) =>
  (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    cb(e)
  }
