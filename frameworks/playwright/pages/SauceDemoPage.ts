import { expect, type Page } from '@playwright/test';

import { customer, product } from '../../../shared/testData';

export class SauceDemoPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.locator('[data-test="username"]').fill(username);
    await this.page.locator('[data-test="password"]').fill(password);
    await this.page.locator('[data-test="login-button"]').click();
  }

  async expectInventory(): Promise<void> {
    await expect(this.page.locator('[data-test="title"]')).toHaveText('Products');
  }

  async addBackpack(): Promise<void> {
    const item = this.page.locator('[data-test="inventory-item"]').filter({ hasText: product });
    await item.getByRole('button', { name: 'Add to cart' }).click();
  }

  async prices(): Promise<number[]> {
    const values = await this.page.locator('[data-test="inventory-item-price"]').allTextContents();
    return values.map((value) => Number(value.replace('$', '')));
  }

  async completeCheckout(): Promise<void> {
    await this.addBackpack();
    await this.page.locator('[data-test="shopping-cart-link"]').click();
    await this.page.locator('[data-test="checkout"]').click();
    await this.page.locator('[data-test="firstName"]').fill(customer.firstName);
    await this.page.locator('[data-test="lastName"]').fill(customer.lastName);
    await this.page.locator('[data-test="postalCode"]').fill(customer.postalCode);
    await this.page.locator('[data-test="continue"]').click();
    await this.page.locator('[data-test="finish"]').click();
  }
}
