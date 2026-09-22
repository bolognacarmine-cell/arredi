// Cloudinary Configuration Checker
// Run this script to verify Cloudinary configuration in production

console.log('=== Cloudinary Configuration Check ===');
console.log('Environment: ', import.meta.env.MODE);
console.log('Cloud Name: ', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
console.log('Upload Preset: ', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ? 'Set' : 'Not Set');
console.log('API Base URL: ', import.meta.env.VITE_API_BASE_URL);
console.log('====================================');

if (!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME === 'demo') {
  console.error('❌ CLOUDINARY_CLOUD_NAME is not configured or set to "demo"');
  console.error('Please set VITE_CLOUDINARY_CLOUD_NAME in your environment variables');
} else {
  console.log('✅ CLOUDINARY_CLOUD_NAME is configured');
}

if (!import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) {
  console.error('❌ CLOUDINARY_UPLOAD_PRESET is not configured');
  console.error('Please set VITE_CLOUDINARY_UPLOAD_PRESET in your environment variables');
} else {
  console.log('✅ CLOUDINARY_UPLOAD_PRESET is configured');
}

console.log('\n=== Expected Render Environment Variables ===');
console.log('VITE_CLOUDINARY_CLOUD_NAME=qz1f1z6t');
console.log('VITE_CLOUDINARY_UPLOAD_PRESET=farcom-uploads');
console.log('VITE_API_BASE_URL= (empty for same-origin)');
