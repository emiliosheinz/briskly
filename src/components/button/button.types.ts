import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'

export type ButtonVariants = 'primary' | 'secondary' | 'bad'

export type ButtonProps = {
  variant?: ButtonVariants
  fullWidth?: boolean
} & Omit<
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
  'className'
>
