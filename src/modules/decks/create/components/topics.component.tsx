import { useState } from 'react'

import { PlusCircleIcon } from '@heroicons/react/24/outline'

import { NewTopicModal } from '~/components/modal/new-topic/new-topic-modal.component'
import { Pill } from '~/components/pill'
import { MAX_TOPICS_PER_DECK } from '~/constants'
import { useCreateNewDeckContext } from '~/contexts/create-new-deck'

export const Topics = () => {
  const { topics, addTopic, deleteTopic } = useCreateNewDeckContext()

  const [isCreatingTopic, setIsCreatingTopic] = useState(false)

  return (
    <>
      <h2 className='text-xl font-semibold'>Tópicos</h2>
      <div className='flex w-full flex-wrap gap-4'>
        {topics.map(({ title: topic }, idx) => (
          <Pill key={topic} isDeletable onClick={() => deleteTopic(idx)}>
            {topic}
          </Pill>
        ))}
        <Pill
          isDisabled={topics.length >= MAX_TOPICS_PER_DECK}
          onClick={() => setIsCreatingTopic(true)}
        >
          <PlusCircleIcon className='w-6, h-6' />
        </Pill>
      </div>
      <NewTopicModal
        isOpen={isCreatingTopic}
        setIsOpen={setIsCreatingTopic}
        onSubmit={values => addTopic(values.title)}
      />
    </>
  )
}
