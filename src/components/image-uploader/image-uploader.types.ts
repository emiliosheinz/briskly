export type ImageUploaderProps = {
  id: string
  error?: string
} & Omit<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  'type' | 'id'
>
