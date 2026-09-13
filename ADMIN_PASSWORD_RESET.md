# Admin Authentication Guide

This guide explains how to manage the Farcom admin user account, including login, session management, and password reset procedures.

## Initial Setup

### Step 1: Create Admin User

Run the seed script to create the initial admin user:

```bash
cd server
npm run seed:admin
```

### Step 2: Initial Credentials

After running the seed script, you can log in with:

- **Email**: `admin@farcom.local`
- **Password**: `Farcom2026`
- **Role**: `admin`

## Admin Login

### Login Page

Navigate to `/admin/login` to access the admin login page.

### Login Endpoint

- **URL**: `POST /api/admin/login`
- **Body**: `{ "email": "admin@farcom.local", "password": "Farcom2026" }`
- **Response**: 
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

### Session Management

- Sessions are stored server-side using `express-session`
- Session cookie: `farcom.sid` (HttpOnly, Secure in production)
- Session duration: 24 hours
- Cookie attributes:
  - `httpOnly: true` - Prevents JavaScript access
  - `secure: true` (production) - Only sent over HTTPS
  - `sameSite: 'lax'` - CSRF protection

### Logout

- **URL**: `POST /api/admin/logout`
- Clears session and redirects to `/admin/login`

## Password Reset

If you forget the admin password, you can reset it using the dedicated API endpoint.

### Endpoint Details

- **URL**: `POST /api/admin/reset-admin-password`
- **Protection**: Requires `X-Admin-Reset-Secret` header
- **Secret**: Must match `ADMIN_RESET_SECRET` from `.env`

### Reset Procedure

#### 1. Set the Reset Secret

Make sure `ADMIN_RESET_SECRET` is set in your `server.env` file:

```env
ADMIN_RESET_SECRET=your_secure_random_secret_here
```

**Important**: Generate a strong, random secret. Never commit this to version control.

#### 2. Reset the Password

Use curl to reset the password:

```bash
curl -X POST https://arredi-api.onrender.com/api/admin/reset-admin-password \
  -H "Content-Type: application/json" \
  -H "X-Admin-Reset-Secret: your_secure_random_secret_here" \
  -d '{"email": "admin@farcom.local"}'
```

Or using JavaScript fetch:

```javascript
fetch('https://arredi-api.onrender.com/api/admin/reset-admin-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Admin-Reset-Secret': 'your_secure_random_secret_here'
  },
  body: JSON.stringify({
    email: 'admin@farcom.local'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Response

**Success Response** (200):
```json
{
  "success": true,
  "message": "Password admin resettata con successo",
  "newPassword": "buongiorno"
}
```

**Error Responses**:

- **403 Unauthorized**: Invalid or missing reset secret
- **404 Not Found**: User not found
- **403 Forbidden**: User is not an admin
- **400 Bad Request**: Email is required
- **500 Internal Server Error**: Server error

### New Password After Reset

After a successful reset, the admin password will be set to:

- **New Password**: `buongiorno`

You can then log in with:
- **Email**: `admin@farcom.local`
- **Password**: `buongiorno`

## Security Notes

1. **Never commit secrets**: `ADMIN_RESET_SECRET` and `SESSION_SECRET` should never be in version control
2. **Use strong secrets**: Generate random, complex secrets for production
3. **Limit access**: Only authorized personnel should know the reset secret
4. **Change after reset**: After resetting the password, change it immediately in the admin panel
5. **Monitor logs**: The endpoint logs password reset attempts for audit purposes
6. **Password hashing**: All passwords are hashed with bcrypt before storage
7. **Session security**: Sessions are server-side with HttpOnly cookies

## Environment Variables

Required environment variables for the admin system:

- `SESSION_SECRET`: Secret key for session encryption (required)
- `ADMIN_RESET_SECRET`: Secret key for password reset endpoint (required)
- `MONGODB_URI`: MongoDB connection string (already required)
- `NODE_ENV`: Set to `production` for secure cookies (recommended)

## Protected API Routes

All admin API routes are protected with the `requireAdmin` middleware:

- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/batch` - Batch replace projects
- `POST /api/media` - Create media
- `PUT /api/media/:id` - Update media
- `DELETE /api/media/:id` - Delete media
- `POST /api/quotes` - Create quote
- `PUT /api/quotes/:id` - Update quote
- `DELETE /api/quotes/:id` - Delete quote
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/offers` - Create offer
- `PUT /api/offers/:id` - Update offer
- `DELETE /api/offers/:id` - Delete offer

**Response for unauthorized access**:
- **401 Unauthorized**: No active session
- **403 Forbidden**: User not admin

## Troubleshooting

### Seed script fails

- Check that MongoDB is accessible
- Verify `MONGODB_URI` in `server.env`
- Ensure you're running from the correct directory

### Login fails

- Verify email and password are correct
- Check that the admin user exists (run seed script)
- Verify server is running and accessible
- Check browser console for errors

### Reset endpoint returns 403

- Verify `ADMIN_RESET_SECRET` is set in `server.env`
- Check that the secret matches exactly in the request header
- Ensure the header name is `X-Admin-Reset-Secret` (case-sensitive)

### User not found (404)

- Verify the email is exactly `admin@farcom.local` (lowercase)
- Run the seed script to create the user if it doesn't exist

### User is not admin (403)

- The user exists but has role `user` instead of `admin`
- Run the seed script again to update the role to `admin`

### Session issues

- Clear browser cookies and try again
- Verify `SESSION_SECRET` is set in `server.env`
- Check that cookies are enabled in browser
- Verify CORS settings if accessing from different domain

## Production Deployment

### Render Configuration

1. Set environment variables in Render dashboard:
   - `SESSION_SECRET`: Generate a strong random secret
   - `ADMIN_RESET_SECRET`: Generate a strong random secret
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`

2. Ensure HTTPS is enabled (automatic on Render)

3. Restart the application after setting environment variables

### Security Checklist

- [ ] Strong `SESSION_SECRET` set
- [ ] Strong `ADMIN_RESET_SECRET` set
- [ ] `NODE_ENV=production` set
- [ ] HTTPS enabled
- [ ] Admin user created with seed script
- [ ] Default password changed after first login
- [ ] Access logs monitored
