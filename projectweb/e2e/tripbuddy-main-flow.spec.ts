import { test, expect, type Page } from '@playwright/test';

async function resetStorage(page: Page) {
  await page.goto('/home');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function completeMainFlowOnboarding(page: Page, suffix: string) {
  const groupName = `TripBuddy QA ${suffix}`;
  const memberName = `Tester ${suffix}`;
  const groupPassword = `pass-${suffix}`;

  await page.goto('/home');
  await page.getByRole('button', { name: 'Create New Group' }).click();
  await expect(page).toHaveURL(/\/create-group$/);

  await page.locator('#groupName').fill(groupName);
  await page.locator('#groupPassword').fill(groupPassword);
  await page.locator('#confirmPassword').fill(groupPassword);
  await page.getByRole('button', { name: 'Create Group & Continue' }).click();
  await expect(page).toHaveURL(/\/profile-setup$/);

  await page.locator('#name').fill(memberName);
  await page.getByRole('button', { name: 'Complete & Join Group' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  return { groupName, memberName };
}

async function addInventoryProduct(page: Page, productName: string, quantity = '2') {
  await page.getByRole('button', { name: 'Add Item' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Add Product' })).toBeVisible();

  await dialog.locator('#productName').fill(productName);
  await dialog.locator('#supermarket').fill('Walmart');
  await dialog.locator('#price').fill('12');
  await dialog.locator('#quantity').fill(quantity);
  await dialog.locator('#category').fill('Meat');

  await dialog.getByRole('button', { name: 'Add Product' }).click();

  return page
    .locator('div')
    .filter({ hasText: productName })
    .filter({ hasText: 'Walmart' })
    .first();
}

test.describe('TripBuddy main flow', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test('can finish onboarding and reach dashboard', async ({ page }) => {
    const { groupName } = await completeMainFlowOnboarding(page, 'onboarding');

    await expect(page.getByRole('heading', { name: groupName })).toBeVisible();
    await expect(page.getByText('Share Code')).toBeVisible();
    await expect(page.getByText('Quick Actions')).toBeVisible();
  });

  test('can add product from Smart Inventory dialog', async ({ page }) => {
    await completeMainFlowOnboarding(page, 'inventory');

    await page.getByText('Smart Inventory').first().click();
    await expect(page).toHaveURL(/\/inventory$/);

    const productEntry = await addInventoryProduct(page, 'Premium Burgers', '2');

    await expect(productEntry).toContainText('Premium Burgers');
    await expect(productEntry).toContainText('Walmart');
    await expect(productEntry).toContainText('$24.00');
  });

  test('can claim an added product in inventory', async ({ page }) => {
    await completeMainFlowOnboarding(page, 'claim');

    await page.getByText('Smart Inventory').first().click();
    await expect(page).toHaveURL(/\/inventory$/);

    const productEntry = await addInventoryProduct(page, 'Claim Product', '1');

    await productEntry.getByRole('button', { name: 'Claim' }).click();
    await expect(productEntry).toContainText('Tu');
  });
});
