describe('Testing District homepage', () => {
  
  before(() => {
    // Visit the root URL before running any test case.
    cy.visit('/district/006-rocky%20mountain');
    cy.wait(5000); // 5000 milliseconds = 5 seconds
  });

  it('visits the app root url', () => {
    cy.contains('h1', '006 - Rocky Mountain');
  });
});