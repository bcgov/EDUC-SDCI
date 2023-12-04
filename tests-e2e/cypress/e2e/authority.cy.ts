describe('Testing Authority Page', () => {
  
  before(() => {
    // Visit the root URL before running any test case.
    cy.visit('/authority/100-Abbotsford%20Christian%20School');
    cy.wait(5000); // 5000 milliseconds = 5 seconds
  });

  it('Confirm the Authority is displaying', () => {
    cy.contains('h1', '100 - Abbotsford Christian School');
  });
});