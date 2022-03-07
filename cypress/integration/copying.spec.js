describe('Tests about copying', function() {
  afterEach(() => {
    cy.clearDebugStore();
  });

  it('Copy report to test tab', () => {
    cy.visit('');
    cy.get('#testTab').click();
    cy.get('#metadataTable tbody').find('tr').should('have.length', 0);
    cy.createReport();
    cy.createOtherReport();
    cy.get('#debugTab').click();
    cy.get('#metadataTable tbody').find('tr').should('have.length', 0);
    cy.get('.row #RefreshButton').click();
    cy.get('#metadataTable tbody').find('tr').should('have.length', 2);
    cy.get('button[id="OpenAllButton"]').click();
    cy.get('div.treeview > ul > li').should('have.length', 6);
    // :eq expects a zero-based index
    cy.get('div.treeview > ul > li:not(:contains(other)):eq(1)').click();
    cy.get('button#CopyButton').click();
    cy.get('li#testTab').click();
    cy.get('button#RefreshButton').click();
    cy.get('tbody#testReports').find('tr').should('have.length', 1).within(function(testReport) {
      cy.wrap(testReport).contains('/name').should('have.length', 1);
    });
    cy.get('#debugTab').click();
    cy.get('#metadataTable tbody').find('tr').should('have.length', 2);
    cy.get('div.treeview > ul > li').should('have.length', 6);
  });
});