// 🐨 you'll want a fake user to register as:
import {buildUser} from '../support/generate'

describe('smoke', () => {
  it('should allow a typical user flow', () => {
    const user = buildUser()

    cy.visit('/')
    cy.findByRole('button', {name: /register/i}).click()

    cy.findByRole('dialog').within(() => {
      cy.findByRole('textbox', {name: /username/i}).type(user.username)
      cy.findByLabelText(/password/i).type(user.password)
      cy.findByRole('button', {name: /register/i}).click()
    })

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /discover/i}).click()
    })

    cy.findByRole('main').within(() => {
      cy.findByRole('searchbox', {name: /search/i}).type('the hobbit{enter}')
    })

    cy.findByRole('listitem', {name: /the hobbit/i}).within(() => {
      cy.findByRole('button', {name: /add to list/i}).click()
    })

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /reading list/i}).click()
    })

    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('have.length', 1)
      cy.findByRole('link', {name: /the hobbit/i}).click()
    })

    cy.findByRole('textbox', {name: /notes/i}).type(
      'new notes for testing purposes',
    )
    cy.findByLabelText(/loading/i).should('exist')
    cy.findByLabelText(/loading/i).should('not.exist')

    cy.findByRole('button', {name: /mark as read/i}).click()

    cy.findByRole('radio', {name: /5 stars/i}).click({force: true})

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /finished books/i}).click()
    })

    cy.findByRole('main').should('have.length', 1)

    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('have.length', 1)
      cy.findByRole('radio', {name: /5 stars/i}).should('be.checked')
      cy.findByRole('link', {name: /the hobbit/i}).click()
    })

    cy.findByRole('button', {name: /remove from list/i}).click()

    cy.findByRole('radio', {name: /5 stars/i}).should('not.exist')
    cy.findByRole('textbox', {name: /notes/i}).should('not.exist')

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /finished books/i}).click()
    })

    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('have.length', 0)
    })
  })
})

// 📜 https://docs.cypress.io/guides/core-concepts/introduction-to-cypress.html#Assertions
// (📜 https://docs.cypress.io/api/commands/visit.html)
// 📜 https://docs.cypress.io/api/commands/within.html#Syntax
// 📜 https://docs.cypress.io/api/commands/type.html#Syntax
//   💰 https://docs.cypress.io/api/commands/should.html (.should('have.length', 1))
// the radio buttons are fancy and the inputs themselves are visually hidden
// in favor of nice looking stars, so we have to use the force option to click.
// 📜 https://docs.cypress.io/api/commands/click.html#Arguments
