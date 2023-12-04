describe('Testing District homepage', () => {
  before(() => {
    // Visit the root URL before running any test case.
    cy.visit('/');
  });

  it('visits the app root url', () => {
    cy.contains('h1', 'BC School & District Contact Information');
  });
  before(() => {
    // Visit the root URL before running any test case.
    cy.visit('/district/006-rocky%20mountain');
  });

  it('visits the app root url', () => {
    cy.contains('h1', '006 - Rocky Mountain');
  });
});