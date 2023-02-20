export type TopicsFormProps = {
  topics: Array<{ title: string }>
  onAddTopic: (topicTitle: string) => void
  onDeleteTopic: (topicIdx: number) => void
  tooltipText?: string
}
