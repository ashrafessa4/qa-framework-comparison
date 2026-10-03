import { customer, product, users } from '../../../shared/testData';

describe('SauceDemo comparison scenarios', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('1. valid user signs in', () => {
    cy.login(users.standard.username, users.standard.password);
    cy.get('[data-test="title"]').should('have.text', 'Products');
  });

  it('2. locked user sees an error', () => {
    cy.login(users.locked.username, users.locked.password);
    cy.get('[data-test="error"]').should('contain.text', 'locked out');
  });

  it('3. product can be added to the cart', () => {
    cy.login(users.standard.username, users.standard.password);
    cy.contains('[data-test="inventory-item"]', product)
      .find('button')
      .contains('Add to cart')
      .click();
    cy.get('[data-test="shopping-cart-link"]').click();
    cy.get('[data-test="inventory-item"]').should('contain.text', product);
  });

  it('4. products sort by ascending price', () => {
    cy.login(users.standard.username, users.standard.password);
    cy.get('[data-test="product-sort-container"]').select('lohi');
    cy.get('[data-test="inventory-item-price"]').then(($prices) => {
      const prices = [...$prices].map((element) => Number(element.textContent?.replace('$', '')));
      expect(prices).to.deep.equal([...prices].sort((left, right) => left - right));
    });
  });

  it('5. customer completes checkout', () => {
    cy.login(users.standard.username, users.standard.password);
    cy.contains('[data-test="inventory-item"]', product)
      .find('button')
      .contains('Add to cart')
      .click();
    cy.get('[data-test="shopping-cart-link"]').click();
    cy.get('[data-test="checkout"]').click();
    cy.get('[data-test="firstName"]').type(customer.firstName);
    cy.get('[data-test="lastName"]').type(customer.lastName);
    cy.get('[data-test="postalCode"]').type(customer.postalCode);
    cy.get('[data-test="continue"]').click();
    cy.get('[data-test="finish"]').click();
    cy.get('[data-test="complete-header"]').should('have.text', 'Thank you for your order!');
  });
});
