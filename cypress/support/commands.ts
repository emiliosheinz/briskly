/* eslint-disable @typescript-eslint/ban-ts-comment */

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      login(): void
      getByTestId(id: string): Chainable<JQuery<HTMLElement>>
    }
  }
}

Cypress.Commands.add('login', () => {
  cy.intercept('/api/auth/session', { fixture: 'session.json' }).as('session')

  cy.setCookie(
    'next-auth.session-token',
    Cypress.env('NEXT_AUTH_SESSION_TOKEN'),
  )
})

Cypress.Commands.add('getByTestId', id => {
  return cy.get(`[data-testid=${id}]`)
})

export {}
