import { expect, test } from '@playwright/test'

const ROUTES = [
  '/',
  '/sorting/learn',
  '/sorting/explore',
  '/sorting/practice',
  '/binary-search/learn',
  '/binary-search/explore',
  '/binary-search/practice',
  '/recursion/learn',
  '/recursion/explore',
  '/recursion/practice',
  '/teachers',
  '/about',
]

test.describe('every page loads', () => {
  for (const path of ROUTES) {
    test(path, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))
      await page.goto(path)
      await expect(page.locator('h1').first()).toBeVisible()
      expect(errors).toEqual([])
    })
  }
})

test('every page says it is a demo by the author and not an official UWC site', async ({
  page,
}) => {
  for (const path of ['/', '/sorting/learn', '/about']) {
    await page.goto(path)
    await expect(page.locator('header')).toContainText('Demo by Avag Sargsyan')
    await expect(page.locator('footer')).toContainText('not an official UWC Dilijan website')
  }
})

test('unknown pages show a friendly 404', async ({ page }) => {
  await page.goto('/does-not-exist')
  await expect(page.getByRole('heading', { name: 'This page went missing' })).toBeVisible()
})

test('a module link opens its Learn stage and progress is remembered', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Start', exact: true }).first().click()
  await expect(page).toHaveURL(/\/sorting\/learn$/)
  // Progress is saved shortly after a change (debounced), so wait for it before reloading.
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('cs-playground:v1')))
    .toContain('"sorting"')
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Continue/ }).first()).toBeVisible()
})

test('no horizontal scrolling on the homepage', async ({ page }) => {
  await page.goto('/')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})
