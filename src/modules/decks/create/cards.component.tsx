import { useState } from 'react'

import { PlusCircleIcon } from '@heroicons/react/24/outline'

import { Card } from '~/components/card'
import { NewCardModal } from '~/components/modal/new-card/new-card-modal.component'
import type { CardFormInputValues } from '~/components/modal/new-card/new-card-modal.types'
import { useCreateNewDeckContext } from '~/contexts/create-new-deck'

type NewCardModalState = {
  isOpen: boolean
  cardIdx?: number
}

export const Cards = () => {
  const { cards, addCard, deleteCard, editCard } = useCreateNewDeckContext()

  const [newCardModalState, setNewCardModalState] = useState<NewCardModalState>(
    { isOpen: false },
  )

  const isCreatingNewCard = newCardModalState.cardIdx === undefined

  const modalFieldsValues = isCreatingNewCard
    ? { answer: '', question: '' }
    : cards[newCardModalState.cardIdx!]

  const handleNewCardFormSubmit = (values: CardFormInputValues) => {
    if (isCreatingNewCard) {
      addCard(values)
    } else {
      editCard(newCardModalState.cardIdx!, values)
    }
  }

  const closeModal = (isOpen: boolean) => {
    setNewCardModalState(state => ({
      ...state,
      isOpen,
    }))
  }

  return (
    <>
      <h2 className='text-xl font-semibold'>Cards</h2>
      <div className='w-ful flex flex-wrap gap-5'>
        {cards.map((card, idx) => (
          <Card
            isEditable
            key={`${card.question}-${card.answer}`}
            onDeletePress={() => deleteCard(idx)}
            onEditPress={() => {
              setNewCardModalState({ isOpen: true, cardIdx: idx })
            }}
          >
            {card.question}
          </Card>
        ))}
        <Card onClick={() => setNewCardModalState({ isOpen: true })}>
          <PlusCircleIcon className='h-12 w-12' />
        </Card>
      </div>
      <NewCardModal
        isOpen={newCardModalState.isOpen}
        setIsOpen={closeModal}
        onSubmit={handleNewCardFormSubmit}
        defaultValues={modalFieldsValues}
      />
    </>
  )
}
