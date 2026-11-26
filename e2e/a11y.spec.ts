import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const PAGES = [
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
  '/teachers/sorting',
  '/about',
]

// WCAG 2.1 AA checks on every page (§8 of the plan).
for (const path of PAGES) {
  test(`accessibility: ${path}`, async ({ page }) => {
    await page.goto(path)
    await page.locator('h1').first().waitFor()
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const summary = results.violations.map(
      (v) => `${v.id} (${v.impact}): ${v.nodes.length}× e.g. ${v.nodes[0]?.target.join(' ')}`,
    )
    expect(summary).toEqual([])
  })
}
