import { useState } from 'react'

import { PlusCircleIcon } from '@heroicons/react/24/outline'

import { Card } from '~/components/card'
import { Loader } from '~/components/loader'
import { NewCardModal } from '~/components/modal/new-card/new-card-modal.component'
import type { CardFormInputValues } from '~/components/modal/new-card/new-card-modal.types'
import { Tooltip } from '~/components/tooltip'
import { useCreateNewDeckContext } from '~/contexts/create-new-deck'

type NewCardModalState = {
  isOpen: boolean
  cardIdx?: number
}

export const Cards = () => {
  const {
    cards,
    addCard,
    deleteCard,
    editCard,
    topics,
    generateAiPoweredCards,
    isGeneratingAiPoweredCards,
    hasErrorGeneratingAiPoweredCards,
  } = useCreateNewDeckContext()

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

  const renderAiCardsButton = () => {
    const successContent = isGeneratingAiPoweredCards ? (
      <Loader />
    ) : (
      <span className='text-4xl'>🤖</span>
    )

    const errorContent = (
      <span className='text-lg text-error-700'>
        Houve um erro ao gerar os Cards. Clique aqui para tentar novamente!
      </span>
    )

    return (
      <Card onClick={() => generateAiPoweredCards({ topics })}>
        {hasErrorGeneratingAiPoweredCards ? errorContent : successContent}
        <div className='absolute right-0 top-0 p-3'>
          <Tooltip
            hint={`Além de criar seus próprios Flashcards manualmente você pode deixar que a nossa Inteligência Artificial os gere para você se baseando nos tópicos previamente cadastrados acima. Lembre-se, a quantidade de Cards criados pode variar de acordo com o tamanho das perguntas e respostas geradas mas deve girar em torno de 3.`}
          />
        </div>
      </Card>
    )
  }

  return (
    <>
      <h2 className='text-xl font-semibold'>Cards</h2>
      <div className='w-ful flex flex-wrap gap-5'>
        {cards.map((card, idx) => (
          <Card
            isEditable
            isAiPowered={card.isAiPowered}
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
        {renderAiCardsButton()}
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
