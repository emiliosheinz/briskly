export type ImageUploaderProps = {
  id: string
  error?: string
  defaultValue?: string
} & Omit<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  'type' | 'id' | 'defaultValue'
>
