# Render Environment Variables Setup Guide

## ⚠️ CRITICAL: Cloudinary Configuration for Image Uploads

The most common cause of "Upload Cloudinary fallito" errors is missing Cloudinary environment variables on Render.

## Required Environment Variables for Render

### MongoDB & Database
```
MONGODB_URI=mongodb+srv://soniaianos1980_db_user:09TC80VbN2mD9jew@cluster0.uvcxexx.mongodb.net/arredi?retryWrites=true&w=majority
```

### Server Configuration
```
PORT=3001
NODE_ENV=production
```

### CORS Configuration
```
FRONTEND_ORIGIN=https://arredi.onrender.com
```

### Frontend Configuration
```
VITE_API_BASE_URL=
```
(Leave empty for same-origin deployment)

### 🔥 CRITICAL: Cloudinary Configuration (REQUIRED for Image Uploads)
```
VITE_CLOUDINARY_CLOUD_NAME=qz1f1z6t
VITE_CLOUDINARY_UPLOAD_PRESET=farcom-uploads
```

### Admin Authentication
```
SESSION_SECRET=your_secure_random_session_secret_here
ADMIN_EMAIL=admin@farcom.local
ADMIN_PASSWORD=Farcom2026
ADMIN_NAME=Admin Farcom
```

## How to Set Environment Variables on Render

1. Go to your Render dashboard
2. Select your service (arredi)
3. Navigate to "Environment" tab
4. Add each variable from the list above
5. Click "Save Changes"
6. **IMPORTANT**: After adding environment variables, you must trigger a new deploy for them to take effect

## Verification Steps

### 1. Check Cloudinary Configuration
After deployment, open the browser console on https://arredi.onrender.com/admin/progetti and look for:
```
[Cloudinary Config] { cloudName: "qz1f1z6t", hasUploadPreset: true, isConfigured: true, isProduction: true }
```

If you see:
```
cloudName: "demo" or hasUploadPreset: false
```
Then the environment variables are not set correctly.

### 2. Test Image Upload
1. Login to admin panel
2. Navigate to /admin/progetti/nuovo
3. Try to upload an image
4. Check browser console for detailed upload logs

### 3. Check Health Endpoint
Visit https://arredi.onrender.com/health to verify the server is running

## Common Issues

### Issue: "Upload Cloudinary fallito"
**Solution**: Ensure both `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` are set in Render environment variables and trigger a new deploy.

### Issue: 401 Unauthorized on admin routes
**Solution**: Ensure `SESSION_SECRET` is set and MongoDB is accessible for session storage.

### Issue: Variables not taking effect
**Solution**: Environment variables only take effect after a new deploy. Trigger a manual deploy after adding variables.

## Cloudinary Dashboard Configuration

Ensure that in your Cloudinary dashboard:
1. The upload preset "farcom-uploads" exists
2. It's configured as "Unsigned" (no signing required)
3. It allows uploads from your domain
4. Folder settings are appropriate (e.g., auto-create folders)

## Production vs Development

### Development (.env)
```
VITE_CLOUDINARY_CLOUD_NAME=qz1f1z6t
VITE_CLOUDINARY_UPLOAD_PRESET=farcom-uploads
VITE_API_BASE_URL=http://localhost:3002
```

### Production (Render)
```
VITE_CLOUDINARY_CLOUD_NAME=qz1f1z6t
VITE_CLOUDINARY_UPLOAD_PRESET=farcom-uploads
VITE_API_BASE_URL=
```

## Security Notes

- Never commit actual API keys or secrets to git
- Use strong, random SESSION_SECRET in production
- Regularly rotate credentials
- Monitor Cloudinary usage for abuse
