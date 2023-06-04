const createDeckUrl = 'http://localhost:3000/decks/create/new'

const deckData = {
  title: 'História do Brasil',
  description:
    'A História do Brasil começa com a chegada dos primeiros humanos na América do Sul há pelo menos 22 000 anos AP.',
  topics: ['Colonização', 'Independência', 'Política', 'Economia'],
}

describe('Create Deck', () => {
  it('O usuário consegue criar um deck utilizando inteligência artificial', () => {
    cy.visit(createDeckUrl)

    cy.get('[data-testid=deck-name]').type(deckData.title)
    cy.get('[data-testid=deck-description]').type(deckData.description)
  })
})
