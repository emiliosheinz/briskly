/**
 * @jest-environment node
 */

import { faker } from '@faker-js/faker'
import { Visibility } from '@prisma/client'
import type { inferProcedureInput } from '@trpc/server'
import { TRPCError } from '@trpc/server'

import type { AppRouter } from '~/server/api/root'
import { createTRPCCallerMock } from '~/utils/tests/trpc'

const makeNewDeck = () => ({
  id: faker.datatype.uuid(),
  ownerId: faker.datatype.uuid(),
  title: faker.random.words(3),
  description: faker.random.words(10),
  visibility: Visibility.Public,
})

const makeCreateNewDeckInput = (): inferProcedureInput<
  AppRouter['decks']['createNewDeck']
> => ({
  title: faker.random.words(3),
  description: faker.random.words(10),
})

describe('API Decks Router', () => {
  it('should create a new deck when authenticated', async () => {
    const { caller, prisma } = await createTRPCCallerMock({
      session: 'authenticated',
    })

    const deck = makeNewDeck()
    prisma.deck.create.mockResolvedValue(deck)

    const createDeck = caller.decks.createNewDeck(makeCreateNewDeckInput())

    await expect(createDeck).resolves.toEqual(deck)
  })

  it('should throw an error when unauthenticated', async () => {
    const { caller } = await createTRPCCallerMock({
      session: 'unauthenticated',
    })

    const createDeck = caller.decks.createNewDeck(makeCreateNewDeckInput())
    const unauthorizedError = new TRPCError({ code: 'UNAUTHORIZED' })

    await expect(createDeck).rejects.toEqual(unauthorizedError)
  })
})
