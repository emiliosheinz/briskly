import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/24/solid'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { type NextPage } from 'next'
import Head from 'next/head'

import { Feedback } from '~/components/feedback'
import { AnswerValidationReportItem } from '~/modules/decks/reports/components/answer-validation-report-item.component'
import { getServerAuthSession } from '~/server/common/auth'
import { prisma } from '~/server/common/db'
import type { WithAuthentication } from '~/types/auth'
import { api } from '~/utils/api'
import { classNames } from '~/utils/css'

export const getServerSideProps: GetServerSideProps<{
  deckId?: string
}> = async context => {
  const deckId = context.params?.id as string

  if (!deckId) return { notFound: true }

  const session = await getServerAuthSession(context)

  if (!session?.user) return { props: {} }

  const deck = await prisma.deck.findFirst({
    where: { id: deckId, ownerId: session.user.id },
  })

  if (!deck) {
    return { notFound: true }
  }

  return {
    props: {
      deckId,
    },
  }
}

const ReviewDeckPage: WithAuthentication<
  NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>
> = props => {
  const { deckId } = props

  const {
    isLoading,
    data: deck,
    isError,
  } = api.answerValidationReports.getCardsWithAnswerValidationReports.useQuery(
    { deckId: deckId! },
    { enabled: !!deckId },
  )

  const renderCards = () => {
    const visibleCards = deck?.cards.filter(
      card => card.answerValidationReports.length > 0,
    )

    if (!visibleCards?.length) {
      return (
        <Feedback
          shouldHideButton
          title='Sem reports!'
          subtitle='Parece que o seu Deck não tem nenhum report pendente. Volte mais tarde.'
        />
      )
    }

    return visibleCards.map(card => (
      <Disclosure key={card.question}>
        {({ open }) => (
          <>
            <Disclosure.Button className='my-2 flex w-full items-center justify-between rounded-md bg-primary-800 px-5 py-4 text-left text-base font-medium text-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-opacity-75'>
              <span className='flex flex-1'>{card.question}</span>
              <ChevronUpIcon
                className={classNames(
                  'flex h-5 w-5 text-primary-50',
                  open ? 'rotate-180 transform' : '',
                )}
              />
            </Disclosure.Button>
            <Disclosure.Panel className='text-gray-500 flex flex-col justify-center gap-2 divide-y divide-primary-200 px-4 pb-2 text-sm'>
              {card.answerValidationReports.map(report => (
                <AnswerValidationReportItem
                  key={report.id}
                  report={report}
                  deckId={deckId!}
                />
              ))}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    ))
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              className='my-3 h-12 w-full animate-pulse rounded-md bg-primary-200'
              key={idx}
            />
          ))}
        </>
      )
    }

    if (isError) {
      return (
        <Feedback
          shouldHideButton
          title='Erro inesperado!'
          subtitle='Houve um erro inesperado ao buscar os reports do seu Deck. Tente novamente mais tarde'
        />
      )
    }

    return (
      <>
        <h1 className='mb-4 text-2xl font-bold text-primary-900'>
          Solicitações
        </h1>
        <p className='mb-5 max-w-2xl'>
          Aqui você pode visualizar todas as solicitações de revisão das
          respostas dos cards do seu Deck. Atenção: Ao aceitar uma solicitação
          ela passará a ser considerada como uma resposta correta para aquela
          pergunta. OBS: Cada pergunta pode ter no máximo 5 respostas corretas.
        </p>
        {renderCards()}
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Reports</title>
      </Head>
      <div className='w-full'>{renderContent()}</div>
    </>
  )
}

ReviewDeckPage.requiresAuthentication = true

export default ReviewDeckPage
