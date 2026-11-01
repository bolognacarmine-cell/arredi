import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "node:path"

/**
 * Configurazione dei test (Vitest).
 *
 * Separata da vite.config.ts per non toccare la build di produzione.
 * - jsdom: i componenti React vengono renderizzati in DOM finto
 * - src/test/setup.ts: cleanup di testing-library + matchers jest-dom
 * - VITE_API_BASE_URL può arrivare dal .env locale: i test non toccano mai la
 *   rete (fetch è stubblata e fallisce), quindi blogApi usa comunque il
 *   fallback statico (src/data/blogPosts.json)
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
    // globals: true per coerenza con i test preesistenti (Loading.test.tsx)
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", "dist/**", "server/**"],
  },
})
