describe('Testing Authority Page', () => {
  before(() => {
    // Visit the root URL before running any test case.
    cy.visit('/authority/100-Abbotsford%20Christian%20School');
  });

  it('visits the app root url', () => {
    cy.contains('h2', '100 - Abbotsford Christian School');
  });
});