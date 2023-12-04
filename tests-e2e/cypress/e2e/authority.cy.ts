describe('Testing Authority Page', () => {
  
  before(() => {
    // Visit the root URL before running any test case.
    cy.visit('/authority/100-Abbotsford%20Christian%20School');
  });

  it('Confirm the Authority is displaying', () => {
    cy.contains('h1', '100 - Abbotsford Christian School', { timeout: 10000 });
  });
});