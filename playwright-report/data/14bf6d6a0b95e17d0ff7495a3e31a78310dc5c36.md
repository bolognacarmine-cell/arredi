# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.e2e.spec.ts >> Navigation >> should navigate to Contatti page
- Location: e2e\navigation.e2e.spec.ts:66:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('a[href="/contatti"]')
Expected: visible
Error: strict mode violation: locator('a[href="/contatti"]') resolved to 5 elements:
    1) <a href="/contatti" data-discover="true" class="text-base font-semibold transition-all duration-300 relative group text-[#6B7280] hover:text-[#1A1A2E]">…</a> aka getByRole('navigation').getByRole('link', { name: 'Contatti' })
    2) <a href="/contatti" data-discover="true" class="inline-flex items-center self-start sm:self-auto min-h-[36px] sm:min-h-[40px] px-2 -ml-2 font-semibold text-[#E69138] hover:text-[#F0B46C] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E69138] rounded-md">Parla con noi →</a> aka getByRole('link', { name: 'Parla con noi →' })
    ...

Call log:
  - Expect "toBeVisible" locator('a[href="/contatti"]') with timeout 5000ms
  - waiting for locator('a[href="/contatti"]')

```

```
Tearing down "context" exceeded the test timeout of 30000ms.
```