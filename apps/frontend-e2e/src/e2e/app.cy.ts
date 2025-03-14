/* eslint-disable cypress/no-unnecessary-waiting */
describe('frontend', () => {
  it('should test artifacts images to check if main stat is being parsed correctly', () => {
    cy.visit('/#/artifacts', { timeout: 600000 })
    cy.get('.MuiModal-root [data-testid="CloseIcon"]').click()
    cy.contains('button', 'Add New Artifact').click()
    cy.contains('button', 'Add Artifact').as('addArtifact')
    cy.contains('label', 'Upload Screenshot').selectFile('assets/em_155.png')
    cy.wait(5000)
    cy.contains('button', 'Add Artifact', { timeout: 60000 }).should(
      'not.be.disabled',
    )
    cy.get(
      '[data-testid="artifact-editor"] [data-testid="main-stat"] button',
    ).should('have.text', 'Elemental Mastery')
    cy.get(
      '[data-testid="artifact-editor"] [data-testid="main-stat"] p',
    ).should('have.text', '155')

    cy.contains('button', 'Clear').click()
    cy.wait(500)

    cy.contains('label', 'Upload Screenshot').selectFile('assets/def_p_8_7.png')
    cy.wait(5000)
    cy.contains('button', 'Add Artifact', { timeout: 60000 }).should(
      'not.be.disabled',
    )
    cy.get(
      '[data-testid="artifact-editor"] [data-testid="main-stat"] button',
    ).should('have.text', 'DEF%')
    cy.get(
      '[data-testid="artifact-editor"] [data-testid="main-stat"] p',
    ).should('have.text', '8.7%')
  })
})
