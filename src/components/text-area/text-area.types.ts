export type TextAreaProps = {
  error?: string
  label: string
  id: string
} & Omit<
  React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >,
  'id'
>
