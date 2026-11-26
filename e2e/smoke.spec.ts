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
    await expect(page.locator('footer')).toContainText('Not an official UWC Dilijan website')
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

test.describe('every playground steps forward and back', () => {
  for (const lesson of ['sorting', 'binary-search', 'recursion']) {
    test(lesson, async ({ page }) => {
      await page.goto(`/${lesson}/explore`)
      const main = page.getByRole('group', { name: 'Playback controls' }).first()
      await expect(main).toContainText('Step 1 /')
      await main.getByRole('button', { name: /Next step/ }).click()
      await main.getByRole('button', { name: /Next step/ }).click()
      await expect(main).toContainText('Step 3 /')
      await main.getByRole('button', { name: /Previous step/ }).click()
      await expect(main).toContainText('Step 2 /')
    })
  }
})

test('lessons and teacher notes list their references', async ({ page }) => {
  for (const path of [
    '/sorting/learn',
    '/binary-search/learn',
    '/recursion/learn',
    '/teachers/recursion',
  ]) {
    await page.goto(path)
    const refs = page.getByRole('region', { name: 'References and further reading' })
    await expect(refs).toBeVisible()
    await expect(refs.getByRole('link', { name: /CS50x, Week 3/ })).toHaveAttribute(
      'href',
      'https://cs50.harvard.edu/x/weeks/3/',
    )
  }
})

test('the About page starts with the author’s contact details', async ({ page }) => {
  await page.goto('/about')
  const card = page.getByRole('region', { name: 'Avag Sargsyan' })
  await expect(card.getByRole('link', { name: 'avagsargsyan01@gmail.com' })).toHaveAttribute(
    'href',
    'mailto:avagsargsyan01@gmail.com',
  )
  await expect(card.getByRole('link', { name: '+374 77 063 645' })).toHaveAttribute(
    'href',
    'tel:+37477063645',
  )
})

test('an unknown lesson stage shows the 404 page without the stage bar', async ({ page }) => {
  await page.goto('/sorting/unknown')
  await expect(page.getByRole('heading', { name: 'This page went missing' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Lesson stages' })).toHaveCount(0)
  await expect(page).toHaveTitle(/Page not found/)
})
