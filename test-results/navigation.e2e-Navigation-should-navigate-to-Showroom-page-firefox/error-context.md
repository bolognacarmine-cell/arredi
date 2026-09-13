# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.e2e.spec.ts >> Navigation >> should navigate to Showroom page
- Location: e2e\navigation.e2e.spec.ts:42:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:8444/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Navigation', () => {
  4   |   test.beforeEach(async ({ page }) => {
> 5   |     await page.goto('/');
      |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  6   |   });
  7   | 
  8   |   test('should display navigation menu', async ({ page }) => {
  9   |     const nav = page.locator('nav');
  10  |     await expect(nav).toBeVisible();
  11  |   });
  12  | 
  13  |   test('should display logo', async ({ page }) => {
  14  |     const logo = page.locator('a[href="/"] img').first();
  15  |     await expect(logo).toBeVisible();
  16  |   });
  17  | 
  18  |   test('should navigate to home from logo', async ({ page }) => {
  19  |     await page.goto('/settori');
  20  |     const logo = page.locator('a[href="/"] img').first();
  21  |     await logo.click();
  22  |     
  23  |     await expect(page).toHaveURL('/');
  24  |   });
  25  | 
  26  |   test('should navigate to Settori page', async ({ page }) => {
  27  |     const settoriLink = page.locator('a[href="/settori"]');
  28  |     await expect(settoriLink).toBeVisible();
  29  |     await settoriLink.click();
  30  |     
  31  |     await expect(page).toHaveURL('/settori');
  32  |   });
  33  | 
  34  |   test('should navigate to Progetti page', async ({ page }) => {
  35  |     const progettiLink = page.locator('a[href="/progetti"]');
  36  |     await expect(progettiLink).toBeVisible();
  37  |     await progettiLink.click();
  38  |     
  39  |     await expect(page).toHaveURL('/progetti');
  40  |   });
  41  | 
  42  |   test('should navigate to Showroom page', async ({ page }) => {
  43  |     const showroomLink = page.locator('a[href="/showroom"]');
  44  |     await expect(showroomLink).toBeVisible();
  45  |     await showroomLink.click();
  46  |     
  47  |     await expect(page).toHaveURL('/showroom');
  48  |   });
  49  | 
  50  |   test('should navigate to Blog page', async ({ page }) => {
  51  |     const blogLink = page.locator('a[href="/blog"]');
  52  |     await expect(blogLink).toBeVisible();
  53  |     await blogLink.click();
  54  |     
  55  |     await expect(page).toHaveURL('/blog');
  56  |   });
  57  | 
  58  |   test('should navigate to Chi siamo page', async ({ page }) => {
  59  |     const chiSiamoLink = page.locator('a[href="/chi-siamo"]');
  60  |     await expect(chiSiamoLink).toBeVisible();
  61  |     await chiSiamoLink.click();
  62  |     
  63  |     await expect(page).toHaveURL('/chi-siamo');
  64  |   });
  65  | 
  66  |   test('should navigate to Contatti page', async ({ page }) => {
  67  |     const contattiLink = page.locator('a[href="/contatti"]');
  68  |     await expect(contattiLink).toBeVisible();
  69  |     await contattiLink.click();
  70  |     
  71  |     await expect(page).toHaveURL('/contatti');
  72  |   });
  73  | 
  74  |   test('should navigate to Preventivo page', async ({ page }) => {
  75  |     const preventivoLink = page.locator('a[href="/preventivo"]');
  76  |     await expect(preventivoLink).toBeVisible();
  77  |     await preventivoLink.click();
  78  |     
  79  |     await expect(page).toHaveURL('/preventivo');
  80  |   });
  81  | 
  82  |   test('should display footer', async ({ page }) => {
  83  |     const footer = page.locator('footer');
  84  |     await expect(footer).toBeVisible();
  85  |   });
  86  | 
  87  |   test('should have working footer links', async ({ page }) => {
  88  |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  89  |     
  90  |     const footerLink = page.locator('footer a').first();
  91  |     await expect(footerLink).toBeVisible();
  92  |     await footerLink.click();
  93  |     
  94  |     // Should navigate somewhere
  95  |     const url = page.url();
  96  |     expect(url).not.toBe('http://localhost:8443/');
  97  |   });
  98  | 
  99  |   test('mobile menu should toggle', async ({ page }) => {
  100 |     // Set mobile viewport
  101 |     await page.setViewportSize({ width: 375, height: 667 });
  102 |     
  103 |     const menuButton = page.locator('button[aria-label*="Menu"], button[aria-label*="menu"]');
  104 |     await expect(menuButton).toBeVisible();
  105 |     
```