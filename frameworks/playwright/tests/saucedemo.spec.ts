import { test, expect } from '@playwright/test';

import { SauceDemoPage } from '../pages/SauceDemoPage';
import { product, users } from '../../../shared/testData';

test.beforeEach(async ({ page }) => {
  await new SauceDemoPage(page).open();
});

test('1. valid user signs in', async ({ page }) => {
  const app = new SauceDemoPage(page);
  await app.login(users.standard.username, users.standard.password);
  await app.expectInventory();
});

test('2. locked user sees an error', async ({ page }) => {
  const app = new SauceDemoPage(page);
  await app.login(users.locked.username, users.locked.password);
  await expect(page.locator('[data-test="error"]')).toContainText('locked out');
});

test('3. product can be added to the cart', async ({ page }) => {
  const app = new SauceDemoPage(page);
  await app.login(users.standard.username, users.standard.password);
  await app.addBackpack();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page).toHaveURL(/cart\.html$/);
  await expect(
    page.locator('[data-test="inventory-item"]').filter({ hasText: product }),
  ).toHaveCount(1);
});

test('4. products sort by ascending price', async ({ page }) => {
  const app = new SauceDemoPage(page);
  await app.login(users.standard.username, users.standard.password);
  await page.locator('[data-test="product-sort-container"]').selectOption('lohi');
  const prices = await app.prices();
  expect(prices).toEqual([...prices].sort((left, right) => left - right));
});

test('5. customer completes checkout', async ({ page }) => {
  const app = new SauceDemoPage(page);
  await app.login(users.standard.username, users.standard.password);
  await app.completeCheckout();
  await expect(page.locator('[data-test="complete-header"]')).toHaveText(
    'Thank you for your order!',
  );
});
