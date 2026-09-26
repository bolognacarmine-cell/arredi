# Admin Authentication System Documentation

## Overview

This document describes the secure admin authentication system implemented for the Arredi project. The system uses bcrypt password hashing, express-session for session management, and environment variables for configuration.

## Features

- **Secure Password Hashing**: Uses bcrypt with salt rounds of 10
- **Session Management**: express-session with HttpOnly, Secure cookies in production
- **Environment Variables**: All secrets and credentials stored in environment variables
- **Role-Based Access**: Admin-only access to protected routes

## Environment Variables

### Required Variables (Production)

The following environment variables must be configured in Render:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `SESSION_SECRET` | Secret for session encryption | Random 32+ character string |
| `ADMIN_EMAIL` | Admin user email (fixed) | `admin@farcom.local` |
| `ADMIN_PASSWORD` | Admin user password | `Farcom2026` |
| `ADMIN_NAME` | Admin user display name | `Admin Farcom` |
| `NODE_ENV` | Environment mode | `production` |
| `VITE_API_BASE_URL` | Frontend API base URL | `https://arredi.onrender.com` |

### Local Development Variables

For local development, create `server/server.env` with the same variables.

## File Structure

```
server/
├── db.ts                    # MongoDB connection (no localhost fallback)
├── index.ts                 # Express server with session config
├── seedAdmin.ts             # Script to create admin user
├── models/
│   └── User.ts              # User model with bcrypt pre-save hook
├── routes/
│   └── admin.ts             # Admin authentication routes
└── middleware/
    └── requireAdmin.ts      # Middleware to protect admin routes
```

## API Endpoints

### POST /api/admin/login

Authenticate admin user and create session.

**Request:**
```json
{
  "email": "admin@farcom.local",
  "password": "Farcom2026"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "email": "admin@farcom.local",
    "name": "Admin Farcom",
    "role": "admin"
  }
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### POST /api/admin/logout

Destroy admin session.

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### GET /api/admin/me

Get current authenticated admin user info.

**Response (Authenticated):**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "role": "admin"
  }
}
```

**Response (Not Authenticated):**
```json
{
  "success": false,
  "message": "Not authenticated"
}
```

## Frontend Integration

### Login Page

The login page is at `/admin/login` and uses the `useAdminAuth` hook to authenticate.

### Protected Routes

The `RequireAdmin` component wraps admin routes and redirects unauthenticated users to `/admin/login`.

### API Calls

All admin API calls are protected by the `requireAdmin` middleware.

## Security Measures

1. **No Hardcoded Secrets**: All secrets are in environment variables
2. **Password Hashing**: bcrypt with 10 salt rounds
3. **Session Security**: 
   - HttpOnly cookies (prevents XSS)
   - Secure cookies in production (HTTPS only)
   - SameSite: lax (CSRF protection)
4. **Generic Error Messages**: Login failures don't reveal if user exists
5. **Protected Endpoints**: All admin routes require authentication
6. **Git Protection**: `.env` files excluded from git via `.gitignore`

## Setup Instructions

### Initial Setup (One-time)

1. **Configure Environment Variables on Render:**
   - Add all required variables from the table above
   - Generate secure random strings for secrets:
     ```bash
     openssl rand -base64 32
     ```

2. **Create Admin User:**
   - The admin user is created automatically on first deployment if environment variables are set
   - Alternatively, use the seed script locally:
     ```bash
     cd server
     npm run seed:admin
     ```

### Local Development

1. **Create `server/server.env`:**
   ```env
   MONGODB_URI=mongodb+srv://...
   SESSION_SECRET=your_local_secret
   ADMIN_EMAIL=admin@farcom.local
   ADMIN_PASSWORD=Farcom2026
   ADMIN_NAME=Admin Farcom
   NODE_ENV=development
   ```

2. **Run Seed Script:**
   ```bash
   cd server
   npm run seed:admin
   ```

3. **Start Server:**
   ```bash
   npm run dev
   ```

## Troubleshooting

### Login Fails with "Invalid Credentials"

1. Verify admin user exists in database
2. Check environment variables are set correctly
3. Ensure password hash is using bcrypt

### Session Not Persisting

1. Check `SESSION_SECRET` is set
2. Verify cookie configuration (Secure flag in production)
3. Check browser cookie settings

### CORS Errors

1. Ensure `VITE_API_BASE_URL` points to correct domain
2. In production, should be same domain (e.g., `https://arredi.onrender.com`)

## Password Management

**Nota: Endpoint pubblico di reset password amministratore RIMOSSO per sicurezza.**

Se serve ripristinare la password admin:
1. Usare lo script seed one-shot: `cd server && npm run seed:admin` (sovrascrive se ADMIN_EMAIL coincide)
2. Oppure eseguire una modifica diretta sul database MongoDB (cancellare documento utente admin e rieseguire seed)
3. Oppure usare shell Mongo direttamente

## Maintenance

### Regular Tasks

- Rotate `SESSION_SECRET` periodically
- Update admin password regularly
- Monitor MongoDB Atlas for unauthorized access
- Review Render logs for suspicious activity

### Security Best Practices

- Never commit `.env` files to git
- Use strong, unique passwords
- Limit MongoDB Atlas IP whitelist
- Enable MongoDB Atlas authentication
- Monitor for failed login attempts

## Modified Files

The following files were modified/created for this implementation:

- `server/db.ts` - Removed localhost fallback
- `server/index.ts` - Added session configuration, fixed import path
- `server/seedAdmin.ts` - Updated to use environment variables
- `server/models/User.ts` - User model with bcrypt
- `server/routes/admin.ts` - Authentication endpoints
- `server/middleware/requireAdmin.ts` - Admin protection middleware
- `server/routes/projects.ts` - Added requireAdmin middleware
- `server/routes/media.ts` - Added requireAdmin middleware
- `server/routes/quotes.ts` - Added requireAdmin middleware
- `server/routes/products.ts` - Added requireAdmin middleware
- `server/routes/offers.ts` - Added requireAdmin middleware
- `src/pages/admin/AdminLogin.tsx` - Login page component
- `src/hooks/useAdminAuth.tsx` - Authentication hook
- `src/pages/admin/AdminLayout.tsx` - Updated with logout
- `src/App.tsx` - Added login route
- `.gitignore` - Updated to exclude env files
- `server.env.example` - Updated with all variables

## Testing

### Test Authentication Flow

1. Access `/admin` without login → should redirect to `/admin/login`
2. Login with correct credentials → should redirect to `/admin`
3. Access protected API without session → should return 401
4. Logout → should clear session and redirect to login

### Test API Protection

```bash
# Without session (should fail)
curl https://arredi.onrender.com/api/projects

# With session (should succeed)
curl https://arredi.onrender.com/api/projects \
  -H "Cookie: farcom.sid=<session_cookie>"
```

## Production Deployment

The application is deployed on Render with the following configuration:

- **Frontend + Backend**: Single service serving both
- **Database**: MongoDB Atlas
- **Session Store**: MongoStore (MongoDB-based session storage for persistence across restarts)
- **SSL/TLS**: Enabled by Render

For production with multiple instances, consider using Redis for session storage.

## Image Upload and Authentication

### Admin Image Upload Flow

The admin panel uses a two-step image upload process:

1. **Client-side Cloudinary Upload**: Images are uploaded directly to Cloudinary from the frontend using the `useCloudinaryUpload` hook. This doesn't require authentication as it uses unsigned upload presets.

2. **Server-side Metadata Storage**: After successful Cloudinary upload, the image metadata is saved to MongoDB via the `/api/media` endpoint, which requires admin authentication.

### Authentication Requirements

- **Session Management**: Admin authentication uses server-side sessions stored in MongoDB via MongoStore
- **Cookie Configuration**: Sessions use HttpOnly, Secure cookies in production with `sameSite: 'lax'`
- **Credentials**: All API calls must include `credentials: 'include'` to send session cookies
- **Session Duration**: Sessions expire after 24 hours of inactivity

### Troubleshooting Image Upload Issues

If image uploads fail with "Upload Cloudinary fallito" or 401 errors:

1. **Check Authentication Status**: Ensure the admin is properly logged in before attempting uploads
2. **Verify Session Cookie**: Check browser dev tools to ensure the `farcom.sid` cookie is being sent with API requests
3. **Session Persistence**: Sessions are stored in MongoDB, so they persist across server restarts
4. **Fallback Mechanism**: If the API call fails, the system falls back to localStorage for metadata storage
5. **Cloudinary Configuration**: Ensure `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` are set in frontend environment
6. **Production Environment Variables**: On Render, these must be set in the Environment Variables section:
   - `VITE_CLOUDINARY_CLOUD_NAME=qz1f1z6t`
   - `VITE_CLOUDINARY_UPLOAD_PRESET=farcom-uploads`
7. **Console Logging**: Check browser console for detailed Cloudinary upload debugging information

### Security Considerations

- Cloudinary uploads use unsigned presets configured in the Cloudinary dashboard
- Admin API endpoints are protected by the `requireAdmin` middleware
- Session cookies are HttpOnly to prevent XSS attacks
- In production, cookies are set with `Secure` flag for HTTPS-only transmission

## Support

For issues or questions:
1. Check Render logs for errors
2. Verify environment variables are set
3. Test locally with same configuration
4. Review this documentation
