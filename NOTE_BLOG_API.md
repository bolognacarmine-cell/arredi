# Blog API - Fallback Strategy Documentation

## Overview

The blog system implements a robust fallback strategy to ensure the blog always works, even when the backend API is unavailable. This prevents the "blog stops working" scenario that can happen with API-dependent systems.

## How It Works

### Data Sources

1. **Primary Source**: MongoDB API (Express backend on Render)
   - URL configured via `VITE_API_BASE_URL` environment variable
   - Used when the API is available and responsive

2. **Fallback Source**: Static JSON file
   - Location: `src/data/blogPosts.json`
   - Used when:
     - API is not configured (GitHub Pages default)
     - API is configured but fails (network error, 5xx, timeout)

### Decision Logic

```
IF VITE_API_BASE_URL is set:
  TRY fetch from API
  IF API succeeds:
    RETURN API data
  ELSE (API fails):
    LOG warning
    RETURN static data
ELSE (VITE_API_BASE_URL not set):
  RETURN static data directly
```

### Environment Behavior

| Environment | VITE_API_BASE_URL | Behavior |
|-------------|-------------------|----------|
| GitHub Pages (production) | Not set | Uses static data directly |
| GitHub Pages (with API) | Set to Render URL | Tries API first, falls back to static |
| Local development | Not set | Uses static data directly |
| Local development (with API) | Set to localhost:3002 | Tries API first, falls back to static |

## Configuration

### Setting API URL in Production

To use the live API on GitHub Pages:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add a new repository secret:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://your-api.onrender.com` (replace with your actual API URL)
4. Update your GitHub Actions workflow to pass this secret to the build

Example GitHub Actions configuration:
```yaml
- name: Build
  run: npm run build
  env:
    VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
```

### Setting API URL Locally

Create a `.env` file in the project root:

```bash
VITE_API_BASE_URL=http://localhost:3002
```

Or use the default (no .env file needed) to use static data.

**Note**: `.env` is in `.gitignore` for security. Never commit `.env` with real API URLs.

## API Functions

### Read Operations (with fallback)

- `getPosts()` - Get paginated list of posts
- `getPostBySlug(slug)` - Get single post by slug
- `getSectors()` - Get blog sectors/categories

These functions automatically fallback to static data if the API fails.

### Write Operations (API required)

- `createPost()` - Create new post
- `updatePost(id, data)` - Update existing post
- `deletePost(id)` - Delete post

These functions require the API to be configured and will throw an error if not.

## Troubleshooting

### Blog shows no articles

**Check 1: Verify static data exists**
```bash
# Check if blogPosts.json exists and has content
cat src/data/blogPosts.json
```

**Check 2: Check browser console**
- Open browser DevTools (F12)
- Look for `[Blog API]` log messages
- If you see "No API configured, using static data" → Static data is being used
- If you see API errors → Check API URL configuration

**Check 3: Verify VITE_API_BASE_URL**
```bash
# In production, check GitHub Actions secrets
# In development, check .env file
```

### Blog shows old content

**Cause**: Static data is not synchronized with MongoDB

**Solution**: Update `src/data/blogPosts.json` with latest content from MongoDB

To export from MongoDB:
```bash
# Using MongoDB Compass
# 1. Connect to your database
# 2. Find the 'posts' collection
# 3. Export as JSON
# 4. Copy to src/data/blogPosts.json
```

### API calls failing but not falling back

**Check**: Verify the fallback logic is working

In browser console, you should see:
```
[Blog API] Fetching from https://your-api.onrender.com/api/blog/posts
[Blog API] API call failed, falling back to static data: Error: API returned 500
```

If you don't see the fallback message, check the code in `src/api/blogApi.ts`.

## Updating Static Data

When you add or modify blog posts in MongoDB, update the static data to keep it in sync:

1. Export posts from MongoDB (see above)
2. Update `src/data/blogPosts.json`
3. Commit and push changes
4. GitHub Pages will rebuild with new static data

## Console Logging

The API functions log their behavior to help with debugging:

- `[Blog API] No API configured, using static data` - Using static data directly
- `[Blog API] Fetching from {URL}` - Attempting API call
- `[Blog API] Successfully fetched from API` - API call succeeded
- `[Blog API] API call failed, falling back to static data` - API failed, using fallback

## Security Notes

- Never commit `.env` files with real API keys
- Use GitHub Secrets for production configuration
- Static data is public in the repository (no sensitive info in blogPosts.json)

## Performance Considerations

- Static data is faster than API calls (no network latency)
- API calls are attempted first when configured (for real-time data)
- Fallback is instant (no retry delays)

## Future Improvements

Potential enhancements:
- Add cache invalidation for static data
- Implement automatic sync from MongoDB to static data
- Add versioning to static data
- Implement health check for API before attempting calls
