import { faker } from '@faker-js/faker'

const createDeckUrl = '/decks/create/new'

const deckData = {
  title: 'História do Brasil',
  description:
    'A História do Brasil começa com a chegada dos primeiros humanos na América do Sul há pelo menos 22 000 anos AP.',
  topics: ['Colonização', 'Independência', 'Política', 'Economia'],
  image: './cypress/files/deck.jpg',
}

const createDeck = () => {
  cy.login()

  cy.visit(createDeckUrl)

  cy.get('input[type=file]').selectFile(deckData.image, { force: true })
  cy.getByTestId('deck-name').type(deckData.title)
  cy.getByTestId('deck-description').type(deckData.description)

  for (const topic of deckData.topics) {
    cy.getByTestId('new-topic-button').click()
    cy.getByTestId('topic-title-input').type(topic)
    cy.getByTestId('topic-save-button').click()
  }

  cy.getByTestId('ai-powered-flashcards-card').click()
  cy.wait(15_000)

  cy.getByTestId('submit-deck-button').click()
  cy.wait(1000)
}

type ReviewDeckParams = {
  shouldRequestAnswerValidation?: boolean
}

const reviewDeck = ({
  shouldRequestAnswerValidation,
}: ReviewDeckParams = {}) => {
  const answers = []
  let answer = ''
  cy.contains('estudar com este deck', { matchCase: false }).click()

  answer = faker.lorem.sentence()
  answers.push(answer)
  cy.getByTestId('answer-input').type(answer)
  cy.get('button').contains('Responder', { matchCase: false }).click()
  cy.wait(3000)
  if (shouldRequestAnswerValidation) {
    cy.getByTestId('report-button').click({ force: true })
    cy.get('button')
      .contains('Enviar Solicitação', { matchCase: false })
      .click()
  }
  cy.get('button').contains('Próximo Card', { matchCase: false }).click()

  answer = faker.lorem.sentence()
  answers.push(answer)
  cy.getByTestId('answer-input').type(answer)
  cy.get('button').contains('Responder', { matchCase: false }).click()
  cy.wait(3000)
  if (shouldRequestAnswerValidation) {
    cy.getByTestId('report-button').click({ force: true })
    cy.get('button')
      .contains('Enviar Solicitação', { matchCase: false })
      .click()
  }
  cy.get('button').contains('Próximo Card', { matchCase: false }).click()

  answer = faker.lorem.sentence()
  answers.push(answer)
  cy.getByTestId('answer-input').type(answer)
  cy.get('button').contains('Responder', { matchCase: false }).click()
  cy.wait(3000)
  if (shouldRequestAnswerValidation) {
    cy.getByTestId('report-button').click({ force: true })
    cy.get('button')
      .contains('Enviar Solicitação', { matchCase: false })
      .click()
  }
  cy.get('button').contains('OK', { matchCase: false }).click()

  return answers
}

const deleteDeck = () => {
  cy.getByTestId('actions-dropdown-button').click()
  cy.get('button').contains('excluir deck', { matchCase: false }).click()
}

describe('Briskly - E2E', () => {
  it('O usuário consegue criar um deck utilizando Inteligência Artificial', () => {
    createDeck()

    cy.url().should('include', '/decks')
    cy.getByTestId('deck-title').contains(deckData.title).should('exist')
    cy.getByTestId('deck-description')
      .contains(deckData.description)
      .should('exist')

    for (const [idx, topic] of deckData.topics.entries()) {
      cy.getByTestId(`deck-topic-${idx}`)
        .contains(topic.toLowerCase())
        .should('exist')
    }

    cy.getByTestId('deck-cards').get('li').should('have.length.above', 0)

    deleteDeck()
  })

  it('O usuário consegue estudar com um deck enquanto tem suas respostas validadas por meio de Inteligência Artificial', () => {
    createDeck()
    reviewDeck()

    cy.contains('Parabéns!!!', { matchCase: false }).should('exist')
    cy.get('button').contains('ok', { matchCase: false }).click()
    cy.wait(1000)

    deleteDeck()
  })

  it('O sistema faz o controle da repetição espaçada dos flashcards', () => {
    createDeck()
    reviewDeck()

    cy.get('button').contains('ok', { matchCase: false }).click()
    cy.wait(1000)

    cy.contains('Próxima revisão', { matchCase: false })
      .invoke('text')
      .then(text => {
        console.log(text)
        const parts = text.replace('Próxima revisão:', '').split(',')
        const dateParts = parts[0].trim().split('/')
        const timeParts = parts[1].trim().split(':')

        console.log({ parts, dateParts, timeParts })
        const day = Number.parseInt(dateParts[0])
        const month = Number.parseInt(dateParts[1]) - 1
        const year = Number.parseInt(dateParts[2])
        const hours = Number.parseInt(timeParts[0])
        const minutes = Number.parseInt(timeParts[1])

        const currentDate = new Date()
        const futureDate = new Date(year, month, day, hours, minutes)

        expect(futureDate.getTime()).to.be.greaterThan(currentDate.getTime())
      })

    deleteDeck()
  })

  it('O usuário consegue solicitar a revisão de uma resposta considerada incorreta', () => {
    createDeck()
    const answers = reviewDeck({ shouldRequestAnswerValidation: true })

    cy.get('button').contains('ok', { matchCase: false }).click()
    cy.wait(1000)

    cy.reload()
    cy.wait(1000)
    cy.get('button')
      .contains('Acessar solicitações', { matchCase: false })
      .click()
    cy.wait(1000)

    for (const [index, answer] of answers.entries()) {
      cy.getByTestId(`card-requests-${index}`).click()
      cy.contains(answer).should('exist')
      cy.getByTestId(`card-requests-${index}`).click()
    }
  })

  it('Quando uma solicitação de revisão é aceita, a resposta é adicionada a lista de respostas válidas do card', () => {
    createDeck()
    const answers = reviewDeck({ shouldRequestAnswerValidation: true })

    cy.get('button').contains('ok', { matchCase: false }).click()
    cy.wait(1000)

    cy.reload()
    cy.wait(1000)
    cy.get('button')
      .contains('Acessar solicitações', { matchCase: false })
      .click()
    cy.wait(1000)

    // eslint-disable-next-line unicorn/no-array-for-each
    answers.forEach(() => {
      cy.getByTestId(`card-requests-0`).click()
      cy.getByTestId('accept-answer-button').click()
      cy.wait(500)
    })

    cy.go('back')
    cy.wait(1000)

    cy.getByTestId('actions-dropdown-button').click()
    cy.get('button').contains('editar', { matchCase: false }).click()

    cy.getByTestId('edit-card-button').each(($el, idx) => {
      cy.wrap($el).click()
      cy.wait(500)
      cy.getByTestId('card-answer-input')
        .invoke('val')
        .then(text => {
          expect(text?.toString().includes(answers[idx]!)).to.be.true
        })
      cy.getByTestId('close-modal-button').click()
      cy.wait(500)
    })

    cy.get('button').contains('cancelar', { matchCase: false }).click()
    deleteDeck()
  })
})
