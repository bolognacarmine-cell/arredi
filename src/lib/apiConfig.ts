/**
 * API Configuration Utility
 *
 * Centralized logic for handling VITE_API_BASE_URL environment variable.
 *
 * IMPORTANT: Render does not allow empty environment variables. This utility
 * checks if VITE_API_BASE_URL is set to a non-empty value. If undefined or
 * empty string, it defaults to same-origin (relative paths).
 *
 * Usage:
 * - Same-origin (frontend + backend on same domain): DO NOT set VITE_API_BASE_URL
 * - Cross-origin or local dev: Set VITE_API_BASE_URL to full URL (e.g., http://localhost:3002)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

/**
 * Check if API base URL is explicitly configured to a non-empty value
 */
export function isApiBaseUrlConfigured(): boolean {
  return !!(API_BASE_URL && API_BASE_URL.trim() !== '')
}

/**
 * Get API base URL for a given path
 * - If VITE_API_BASE_URL is set to non-empty value: returns absolute URL
 * - If VITE_API_BASE_URL is undefined or empty: returns relative path (same-origin)
 */
export function getApiUrl(path: string): string {
  if (isApiBaseUrlConfigured()) {
    return `${API_BASE_URL.replace(/\/+$/, '')}${path}`
  }
  return path // Use relative path for same-origin
}

/**
 * Get the raw API base URL value (with fallback for local dev)
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL || "http://localhost:3002"
}

/**
 * Log API configuration at startup for debugging
 */
export function logApiConfig(): void {
  console.log('[API Config] VITE_API_BASE_URL =', import.meta.env.VITE_API_BASE_URL)
  console.log('[API Config] API base URL configured:', isApiBaseUrlConfigured())
  console.log('[API Config] Using same-origin:', !isApiBaseUrlConfigured())
}

// Log configuration on module load
logApiConfig()
