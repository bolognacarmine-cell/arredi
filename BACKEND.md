# Backend Documentation - Arredi API

This document describes the backend architecture, setup instructions, and API documentation for the Arredi project.

## Architecture Overview

- **Backend**: Express.js with TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Image Storage**: Cloudinary (client-side uploads)
- **API**: RESTful JSON API
- **Frontend**: React + Vite + TypeScript

## Project Structure

```
arredi/
├── server/                      # Backend server
│   ├── index.ts               # Express server entry point
│   ├── db.ts                  # MongoDB connection
│   ├── types.ts               # Shared TypeScript types
│   ├── models/                # Mongoose models
│   │   ├── Media.ts
│   │   ├── Project.ts
│   │   ├── Product.ts
│   │   ├── Offer.ts
│   │   ├── Quote.ts
│   │   └── SiteConfig.ts
│   ├── routes/                # API routes
│   │   ├── media.ts
│   │   ├── projects.ts
│   │   ├── products.ts
│   │   ├── offers.ts
│   │   ├── quotes.ts
│   │   └── siteConfig.ts
│   ├── package.json           # Server dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   └── server.env.example     # Environment variables template
├── src/                       # Frontend React application
│   ├── api/                   # Frontend API services
│   │   ├── mediaApi.ts
│   │   ├── projectsApi.ts
│   │   ├── productsApi.ts
│   │   ├── offersApi.ts
│   │   ├── quotesApi.ts
│   │   └── siteConfigApi.ts
│   └── ...
├── scripts/                   # Utility scripts
│   └── migrateLocalStorage.ts # Data migration script
└── env.example               # Frontend environment variables template
```

## Database Setup (MongoDB)

### Option 1: MongoDB Atlas (Recommended for Production)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "Free" tier (M0 Sandbox)
   - Select a region closest to your users
   - Name your cluster (e.g., "arredi-cluster")
   - Click "Create"

3. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select Node.js version
   - Copy the connection string
   - It will look like: `mongodb+srv://<username>:<password>@cluster.mongodb.net/arredi?retryWrites=true&w=majority`

4. **Create Database User**
   - In MongoDB Atlas, go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password
   - Grant "Read and write to any database"
   - Click "Create User"

5. **Configure IP Whitelist**
   - In MongoDB Atlas, go to "Network Access"
   - Click "Add IP Address"
   - For development: "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IP addresses

### Option 2: Local MongoDB

1. **Install MongoDB**
   ```bash
   # Windows: Download from mongodb.com
   # Mac: brew install mongodb-community
   # Linux: sudo apt-get install mongodb
   ```

2. **Start MongoDB**
   ```bash
   # Mac/Linux
   mongod

   # Windows (as service)
   net start MongoDB
   ```

3. **Connection String**
   ```
   mongodb://localhost:27017/arredi
   ```

## Environment Variables

### Server Environment Variables (`server/server.env`)

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arredi?retryWrites=true&w=majority

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_ORIGIN=http://localhost:8443

# Cloudinary (optional for server-side operations)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend Environment Variables (`.env`)

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# Cloudinary Configuration (for client-side uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Installation & Setup

### 1. Install Server Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp server.env.example server.env

# Edit server.env with your actual values
# Replace MONGODB_URI with your MongoDB connection string
```

### 3. Start Development Server

```bash
# From project root
npm run server:dev

# Or directly in server directory
cd server
npm run dev
```

The server will start on `http://localhost:3001`

### 4. Build for Production

```bash
npm run server:build
```

### 5. Start Production Server

```bash
npm run server:start
```

## API Endpoints

### Media API

#### GET /api/media
Get all media records

**Query Parameters:**
- `category` (optional): Filter by category ("hero", "sector", "project", "gallery")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "cloudinaryUrl": "https://res.cloudinary.com/...",
      "cloudinaryPublicId": "farcom/progetti/image1",
      "title": "Barber Shop Interior",
      "category": "project",
      "width": 1200,
      "height": 800,
      "format": "jpg",
      "bytes": 245000,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### POST /api/media
Create a new media record

**Request Body:**
```json
{
  "cloudinaryUrl": "https://res.cloudinary.com/...",
  "cloudinaryPublicId": "farcom/progetti/image1",
  "title": "Barber Shop Interior",
  "category": "project",
  "width": 1200,
  "height": 800,
  "format": "jpg",
  "bytes": 245000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "cloudinaryUrl": "https://res.cloudinary.com/...",
    "cloudinaryPublicId": "farcom/progetti/image1",
    "title": "Barber Shop Interior",
    "category": "project",
    "width": 1200,
    "height": 800,
    "format": "jpg",
    "bytes": 245000,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### PUT /api/media/:id
Update a media record

#### DELETE /api/media/:id
Delete a media record

### Projects API

#### GET /api/projects
Get all projects

#### POST /api/projects
Create a new project

**Request Body:**
```json
{
  "id": "barber-milano",
  "title": "The Craft Barbershop",
  "sector": "Barbieri & Parrucchieri",
  "sectorId": "barbieri",
  "location": "Milano",
  "year": 2024,
  "client": "The Craft Milano",
  "description": "Progetto completo per un barbershop...",
  "image": "https://res.cloudinary.com/...",
  "imageCloudinaryPublicId": "farcom/progetti/image1",
  "gallery": ["https://res.cloudinary.com/..."],
  "galleryCloudinaryPublicIds": ["farcom/progetti/image2"],
  "tags": ["Bancone", "Specchiere"],
  "materials": "Noce canaletto, ottone satinato",
  "status": "completato",
  "featured": true
}
```

#### PUT /api/projects/:id
Update a project

#### DELETE /api/projects/:id
Delete a project

### Products API

#### GET /api/products
Get all products

**Query Parameters:**
- `activitySector` (optional): Filter by activity sector
- `active` (optional): Filter by active status (true/false)

#### POST /api/products
Create a new product

#### PUT /api/products/:id
Update a product

#### DELETE /api/products/:id
Delete a product

### Offers API

#### GET /api/offers
Get all offers

**Query Parameters:**
- `activitySector` (optional): Filter by activity sector
- `active` (optional): Filter by active status (true/false)

#### POST /api/offers
Create a new offer

#### PUT /api/offers/:id
Update an offer

#### DELETE /api/offers/:id
Delete an offer

### Quotes API

#### GET /api/quotes
Get all quotes

**Query Parameters:**
- `status` (optional): Filter by status ("pending", "confirmed", "cancelled")

#### POST /api/quotes
Create a new quote

#### PUT /api/quotes/:id
Update a quote

#### DELETE /api/quotes/:id
Delete a quote

### Site Config API

#### GET /api/site-config
Get site configuration

#### PUT /api/site-config
Update site configuration

## Deployment to Render

### 1. Deploy Backend Server

1. **Create Render Account**
   - Go to [Render](https://render.com)
   - Sign up for an account

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `arredi` repository
   - Configure build settings:
     - **Build Command**: `cd server && npm install && npm run build`
     - **Start Command**: `cd server && npm start`
   - Add environment variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `PORT`: `3001`
     - `NODE_ENV`: `production`
     - `FRONTEND_ORIGIN`: Your frontend URL (e.g., `https://arredi.onrender.com`)

3. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your server
   - Once deployed, you'll get a URL like `https://arredi-api.onrender.com`

### 2. Update Frontend Configuration

1. **Add Environment Variables to Frontend**
   - In Render, go to your frontend service
   - Add environment variable:
     - `VITE_API_BASE_URL`: Your backend URL (e.g., `https://arredi-api.onrender.com`)

2. **Redeploy Frontend**
   - Push changes to trigger redeploy
   - Or manually trigger redeploy in Render dashboard

## Data Migration

### Migrating from localStorage to MongoDB

If you have existing data in localStorage, use the migration script:

1. **Export localStorage Data**
   - Open your application in a browser
   - Open browser console (F12)
   - Copy and paste the export function from `scripts/migrateLocalStorage.ts`
   - Run the export function
   - Download the generated JSON file

2. **Import to MongoDB**
   - Ensure your server is running
   - In the browser console, load the import function
   - Run:
     ```javascript
     const file = /* uploaded JSON file */
     importLocalStorageData(file, 'http://localhost:3001')
     ```

## Testing

### Manual Testing Flow

1. **Start Development Environment**
   ```bash
   # Terminal 1: Start backend server
   npm run server:dev

   # Terminal 2: Start frontend
   npm run dev
   ```

2. **Test Media Upload Flow**
   - Navigate to `http://localhost:8443/admin/media`
   - Upload an image via the admin panel
   - Verify the image appears in "Upload recenti"
   - Check MongoDB Atlas dashboard to confirm data storage

3. **Test Cross-Browser Persistence**
   - Upload an image in Browser A
   - Open the application in Browser B
   - Verify the uploaded image is visible
   - This confirms server-side persistence

4. **Test API Endpoints**
   ```bash
   # Test health check
   curl http://localhost:3001/health

   # Test get media
   curl http://localhost:3001/api/media

   # Test create media
   curl -X POST http://localhost:3001/api/media \
     -H "Content-Type: application/json" \
     -d '{
       "cloudinaryUrl": "https://example.com/image.jpg",
       "cloudinaryPublicId": "test/image",
       "category": "project"
     }'
   ```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify MONGODB_URI is correct
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

2. **CORS Errors**
   - Verify FRONTEND_ORIGIN matches your frontend URL
   - Check that CORS is properly configured in server/index.ts

3. **API Not Responding**
   - Check server logs for errors
   - Verify MongoDB connection is established
   - Ensure all environment variables are set

4. **Image Upload Issues**
   - Verify Cloudinary configuration
   - Check upload preset is set to "Unsigned"
   - Ensure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET are set

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different values for development and production
   - Rotate secrets regularly

2. **Database Security**
   - Use strong passwords for MongoDB users
   - Restrict IP access in production
   - Enable MongoDB Atlas security features

3. **API Security**
   - Implement authentication for admin endpoints
   - Rate limit API endpoints
   - Validate and sanitize all inputs

## Performance Optimization

1. **Database Indexing**
   - Add indexes to frequently queried fields
   - Use MongoDB Atlas performance monitoring

2. **Caching**
   - Implement caching for frequently accessed data
   - Consider Redis for session management

3. **Image Optimization**
   - Use Cloudinary transformations for responsive images
   - Implement lazy loading for image galleries

## Support

For issues or questions:
- Check MongoDB Atlas documentation
- Review Render deployment logs
- Consult Express.js and Mongoose documentation
- Check browser console for frontend errors
