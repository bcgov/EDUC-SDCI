describe('Testing District homepage', () => {
  before(() => {
    // Visit the root URL before running any test case.
    cy.visit('/district/006-rocky%20mountain');
  });

  it('visits the app root url', () => {
    cy.contains('h2', '006 - Rocky Mountain');
  });
});