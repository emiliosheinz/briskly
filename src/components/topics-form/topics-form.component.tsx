import { useState } from 'react'

import { PlusCircleIcon } from '@heroicons/react/24/outline'

import { MAX_TOPICS_PER_DECK_AND_USER } from '~/constants'

import { NewTopicModal } from '../modal/new-topic/new-topic-modal.component'
import { Pill } from '../pill'
import { Tooltip } from '../tooltip'
import type { TopicsFormProps } from './topics-form.types'

export function TopicsForm(props: TopicsFormProps) {
  const { topics, tooltipText, onAddTopic, onDeleteTopic } = props

  const [isCreatingTopic, setIsCreatingTopic] = useState(false)

  return (
    <div className='flex flex-col gap-5'>
      <h2 className='flex items-center text-xl font-semibold'>
        Tópicos
        {tooltipText ? <Tooltip hint={tooltipText} /> : null}
      </h2>
      <div className='flex w-full flex-wrap gap-4'>
        {topics.map(({ title: topic }, idx) => (
          <Pill key={topic} isDeletable onClick={() => onDeleteTopic(idx)}>
            {topic}
          </Pill>
        ))}
        <Pill
          isDisabled={topics.length >= MAX_TOPICS_PER_DECK_AND_USER}
          onClick={() => setIsCreatingTopic(true)}
          data-testid='new-topic-button'
        >
          <PlusCircleIcon className='w-6, h-6' />
        </Pill>
      </div>
      <NewTopicModal
        isOpen={isCreatingTopic}
        setIsOpen={setIsCreatingTopic}
        onSubmit={values => onAddTopic(values.title)}
      />
    </div>
  )
}
