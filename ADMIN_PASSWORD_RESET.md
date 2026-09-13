# Admin Password Reset Guide

This guide explains how to manage the Farcom admin user account, including initial setup and password reset procedures.

## Initial Setup

### Step 1: Create Admin User

Run the seed script to create the initial admin user:

```bash
cd server
npx tsx seedAdmin.ts
```

Or from the project root:

```bash
npm run seed:admin
```

### Step 2: Initial Credentials

After running the seed script, you can log in with:

- **Email**: `admin@farcom.local`
- **Password**: `Farcom2026`
- **Role**: `admin`

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

1. **Never commit secrets**: `ADMIN_RESET_SECRET` should never be in version control
2. **Use strong secrets**: Generate a random, complex secret for production
3. **Limit access**: Only authorized personnel should know the reset secret
4. **Change after reset**: After resetting the password, change it immediately in the admin panel
5. **Monitor logs**: The endpoint logs password reset attempts for audit purposes

## Environment Variables

Required environment variables for the admin system:

- `ADMIN_RESET_SECRET`: Secret key for password reset endpoint
- `MONGODB_URI`: MongoDB connection string (already required)

## Troubleshooting

### Seed script fails

- Check that MongoDB is accessible
- Verify `MONGODB_URI` in `server.env`
- Ensure you're running from the correct directory

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
