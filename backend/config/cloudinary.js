const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Cloudinary Config Missing! Pastikan Anda sudah mengisi .env dengan CLOUDINARY_CLOUD_NAME, API_KEY, dan API_SECRET');
    console.error('Current env:', process.env.CLOUDINARY_CLOUD_NAME); // Debugging info
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
