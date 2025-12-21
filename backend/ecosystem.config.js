module.exports = {
  apps: [{
    name: 'urbanmotion-backend',
    script: './index.js',
    cwd: '/home/ubuntu/UrbanMotion/backend',
    env: {
      NODE_ENV: 'production',
      PORT: '5000',
      DB_HOST: 'localhost',
      DB_USER: 'urbanmotion_user',
      DB_PASSWORD: 'Urban2025!Motion',
      DB_DATABASE: 'urbanmotion',
      JWT_SECRET: 'rahasia-urbanmotion-102938',
      JWT_EXPIRES_IN: '7d',
      CLOUDINARY_CLOUD_NAME: 'dzapknsu0',
      CLOUDINARY_API_KEY: '377955861156251',
      CLOUDINARY_API_SECRET: 'zBkmeY8lMEry-zM4hto2OSeqE18',
      MIDTRANS_SERVER_KEY: 'Mid-server-d7Hqa6nqRUqflBkPvDJXSpan',
      MIDTRANS_CLIENT_KEY: 'Mid-client-WAQ7tAcoBl-k3nZU',
      MIDTRANS_IS_PRODUCTION: 'false'
    }
  }]
}
