export type CardProps = {
  children: React.ReactNode
  isEditable?: boolean
  onDeletePress?: () => void
  onEditPress?: () => void
  onClick?: () => void
}
