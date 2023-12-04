describe('Testing Home Page', () => {
  before(() => {
    // Visit the root URL before running any test case.
    cy.visit('/');
  });

  it('visits the app root url', () => {
    cy.contains('h1', 'BC School & District Contact Information', { timeout: 10000 });
  });
});