import { afterEach, beforeAll, beforeEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

// Cleanup del DOM dopo ogni test
afterEach(() => {
  cleanup()
})

// jsdom non implementa scrollTo (usato dal pattern "torna in cima" delle pagine)
beforeAll(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia
  }
})

/**
 * I test non devono mai toccare la rete: ogni fetch non intercettato fallisce
 * in modo esplicito così un test che si "appoggia" all'API non passa per caso.
 */
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      throw new Error(`fetch non previsto nei test: ${String(input)}`)
    })
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})
