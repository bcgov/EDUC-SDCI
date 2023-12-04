describe('Testing School Page', () => {
  
  before(() => {
    // Visit the root URL before running any test case.
    cy.visit('/school/6eb5dc63-450d-01e8-5f97-a0e43ecb6419');
    cy.wait(5000); // 5000 milliseconds = 5 seconds
  });

  it('Confirm school title is displaying', () => {
    cy.contains('h1', '06161064 - Lambrick Park Secondary');
  });
});