# Environment Variables Setup Guide

This document explains how to configure environment variables for the Arredi project, with special attention to the `VITE_API_BASE_URL` variable which controls API routing behavior.

## Overview

The project uses a centralized API configuration utility (`src/lib/apiConfig.ts`) to handle the `VITE_API_BASE_URL` environment variable. This utility ensures consistent behavior across all API calls and works around platform limitations (e.g., Render not allowing empty environment variables).

## VITE_API_BASE_URL Configuration

### Important Note About Render

**Render does not allow environment variables with empty or whitespace-only values.** If you try to set `VITE_API_BASE_URL=""` on Render, you will get an error: "Value cannot be only whitespace".

To work around this limitation, the code checks if `VITE_API_BASE_URL` is set to a **non-empty value**. If the variable is undefined or an empty string, the frontend automatically uses relative paths for same-origin requests.

### Configuration Pattern

The safe pattern used throughout the codebase:

```typescript
if (apiBaseUrl && apiBaseUrl.trim() !== '') {
  // Use absolute URL (cross-origin)
  return `${apiBaseUrl.replace(/\/+$/, '')}${path}`
} else {
  // Use relative path (same-origin)
  return path
}
```

### Environment-Specific Configuration

| Environment | `VITE_API_BASE_URL` | Behavior |
|-------------|-------------------|----------|
| **Render (same-origin)** | **NOT SET** (leave undefined) | Uses relative paths `/api/...` ✅ |
| **Render (same-origin)** | Empty string `""` | Uses relative paths `/api/...` ✅ |
| **Local development (with API)** | `http://localhost:3002` | Uses absolute URL ✅ |
| **Local development (without API)** | Not set | Uses static data/fallbacks ✅ |
| **Cross-origin setup** | `https://api.example.com` | Uses absolute URL ✅ |

### Render Setup (Same-Origin)

**IMPORTANT: DO NOT set `VITE_API_BASE_URL` on Render for same-origin deployment.**

1. Go to your Render dashboard
2. Select the `arredi` service
3. Navigate to "Environment" tab
4. **DO NOT add** `VITE_API_BASE_URL` (leave it unset)
5. Click "Save Changes"
6. Trigger a new deploy

**Verification:**
After deployment, open browser console and check for:
```
[API Config] VITE_API_BASE_URL = undefined
[API Config] API base URL configured: false
[API Config] Using same-origin: true
```

### Local Development Setup

Create a `.env` file in the project root:

```bash
# For local development with backend API
VITE_API_BASE_URL=http://localhost:3002

# OR for local development without backend (static data only)
# VITE_API_BASE_URL=  (leave empty or don't set)
```

**Note:** `.env` is in `.gitignore` for security. Never commit `.env` with real API URLs.

### Cross-Origin Setup

If your frontend and backend are on different domains:

```bash
# Example: Frontend on Vercel, backend on Render
VITE_API_BASE_URL=https://arredi-api.onrender.com
```

**Additional requirements for cross-origin:**
- Backend CORS must include the frontend origin
- Session cookie must have `sameSite: 'none'` (requires `secure: true`)
- Both frontend and backend must use HTTPS

## Other Environment Variables

### Required for Production (Render)

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.uvcxexx.mongodb.net/arredi?retryWrites=true&w=majority

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
FRONTEND_ORIGIN=https://arredi.onrender.com

# Admin Authentication
SESSION_SECRET=<your-secure-random-secret>
ADMIN_EMAIL=admin@farcom.local
ADMIN_PASSWORD=<your-admin-password>
ADMIN_NAME=Admin Farcom

# Cloudinary (REQUIRED for image uploads)
VITE_CLOUDINARY_CLOUD_NAME=qz1f1z6t
VITE_CLOUDINARY_UPLOAD_PRESET=farcom-uploads
```

### Optional for Development

```bash
# Local API (for development)
VITE_API_BASE_URL=http://localhost:3002
```

## API Configuration Utility

The centralized utility (`src/lib/apiConfig.ts`) provides the following functions:

### `getApiUrl(path: string): string`

Returns the appropriate API URL for a given path:
- Absolute URL if `VITE_API_BASE_URL` is set to a non-empty value
- Relative path if `VITE_API_BASE_URL` is undefined or empty

```typescript
import { getApiUrl } from '../lib/apiConfig'

const url = getApiUrl('/api/admin/me')
// Same-origin: '/api/admin/me'
// Cross-origin: 'https://api.example.com/api/admin/me'
```

### `isApiBaseUrlConfigured(): boolean`

Returns `true` if `VITE_API_BASE_URL` is set to a non-empty value.

```typescript
import { isApiBaseUrlConfigured } from '../lib/apiConfig'

if (isApiBaseUrlConfigured()) {
  // API is explicitly configured
} else {
  // Using same-origin or fallback
}
```

### `getApiBaseUrl(): string`

Returns the raw `VITE_API_BASE_URL` value with a fallback for local development.

```typescript
import { getApiBaseUrl } from '../lib/apiConfig'

const baseUrl = getApiBaseUrl()
// Returns: VITE_API_BASE_URL or 'http://localhost:3002'
```

### `logApiConfig(): void`

Logs the current API configuration to the console for debugging. This is called automatically when the module loads.

## Deployment Checklist

### Before Deploying to Render

- [ ] **DO NOT set** `VITE_API_BASE_URL` on Render (leave unset for same-origin)
- [ ] Verify `MONGODB_URI` is set correctly
- [ ] Verify `SESSION_SECRET` is set to a strong random value
- [ ] Verify Cloudinary variables are set (`VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`)
- [ ] Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set

### After Deploying to Render

- [ ] Open https://arredi.onrender.com
- [ ] Open browser DevTools → Console
- [ ] Check for `[API Config]` logs:
  ```
  [API Config] VITE_API_BASE_URL = undefined
  [API Config] API base URL configured: false
  [API Config] Using same-origin: true
  ```
- [ ] Navigate to `/admin/login` and log in
- [ ] Check DevTools → Application → Cookies for `farcom.sid` cookie
- [ ] Refresh and verify `/api/admin/me` returns 200
- [ ] Test image upload functionality

### Common Issues

#### Issue: 401 Unauthorized on admin routes

**Cause:** `VITE_API_BASE_URL` is set on Render, causing cross-origin requests without proper cookie handling.

**Solution:** Delete `VITE_API_BASE_URL` from Render environment variables and redeploy.

#### Issue: "Value cannot be only whitespace" on Render

**Cause:** Trying to set `VITE_API_BASE_URL=""` (empty string) on Render.

**Solution:** Don't set the variable at all. Leave it undefined.

#### Issue: API calls failing in local development

**Cause:** Backend not running or wrong `VITE_API_BASE_URL`.

**Solution:**
- Ensure backend is running on `http://localhost:3002`
- Set `VITE_API_BASE_URL=http://localhost:3002` in `.env`
- Or remove `.env` to use static data fallbacks

## Adding New API Endpoints

When adding new API endpoints, always use the centralized utility:

```typescript
import { getApiUrl } from '../lib/apiConfig'

export async function newEndpoint(): Promise<Data> {
  const response = await fetch(getApiUrl('/api/new-endpoint'), {
    credentials: 'include',
  })
  return response.json()
}
```

**Do NOT use direct environment variable access:**

```typescript
// ❌ WRONG - don't do this
const url = `${import.meta.env.VITE_API_BASE_URL}/api/new-endpoint`

// ✅ CORRECT - use the utility
const url = getApiUrl('/api/new-endpoint')
```

## Security Notes

- Never commit `.env` files to git
- Use strong, random `SESSION_SECRET` in production
- Rotate credentials regularly
- Monitor MongoDB Atlas for unauthorized access
- Review Render logs for suspicious activity

## Troubleshooting

### Debugging API Configuration

The `logApiConfig()` function is called automatically when the `apiConfig` module loads. Check the browser console for:

```
[API Config] VITE_API_BASE_URL = <value>
[API Config] API base URL configured: <true/false>
[API Config] Using same-origin: <true/false>
```

### Checking Network Requests

Open DevTools → Network tab and filter by `/api/`:
- Check Request URL: should be relative `/api/...` for same-origin
- Check Request Headers: should include `Cookie: farcom.sid=...` for authenticated requests
- Check Response status: 200 for successful requests, 401 for unauthorized

### Backend Logs

Check Render logs for authentication debug output:
```
[AUTH CHECK] Method: GET URL: /api/admin/me
[AUTH CHECK] Origin: <origin>
[AUTH CHECK] Session object exists: <true/false>
[AUTH CHECK] User ID in session: <present/missing>
[AUTH CHECK] Cookies: <list of cookies>
```

## Related Documentation

- [Render Environment Setup](../RENDER_ENVIRONMENT_SETUP.md)
- [Admin Authentication](../ADMIN_AUTHENTICATION.md)
- [Blog API Notes](../NOTE_BLOG_API.md)
