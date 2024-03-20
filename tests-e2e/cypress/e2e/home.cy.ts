describe('Testing Home Page', () => {
  before(() => {
    // Visit the root URL before running any test case.
    cy.visit('/');
    cy.wait(5000); // 5000 milliseconds = 5 seconds
  });

  it('visits the app root url', () => {
    cy.contains('h1', 'BC School & District Contact Information');
  });
});