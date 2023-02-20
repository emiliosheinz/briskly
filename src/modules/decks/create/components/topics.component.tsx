import { TopicsForm } from '~/components/topics-form'
import { useCreateNewDeckContext } from '~/contexts/create-new-deck'

export const Topics = () => {
  const { topics, addTopic, deleteTopic } = useCreateNewDeckContext()

  return (
    <TopicsForm
      topics={topics}
      onAddTopic={addTopic}
      onDeleteTopic={deleteTopic}
    />
  )
}
