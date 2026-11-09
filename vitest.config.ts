import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "node:path"

/**
 * Configurazione dei test (Vitest).
 *
 * Separata da vite.config.ts per non toccare la build di produzione.
 * - jsdom: i componenti React vengono renderizzati in DOM finto
 * - setupFiles: src/test/setup.ts registra cleanup + matchers jest-dom e
 *   stubba `fetch` perché nessun test tocchi mai la rete
 * - include/exclude: i test del server usano node:test (`npm run test:server`),
 *   non vanno eseguiti da Vitest
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    pool: "vmThreads",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", "dist/**", "server/**"],
  },
})
