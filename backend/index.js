const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
require('./config/db.js');
require('dotenv').config();

// Security & Rate Limiting
const { apiLimiter, authLimiter, paymentLimiter } = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./routes/authRoutes');
const legitCheckRoutes = require('./routes/legitCheckRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const forumRoutes = require('./routes/forumRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const configRoutes = require('./routes/configRoutes');

const app = express();
const PORT = 3001;
const corsOptions = {
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true,
  optionsSuccessStatus: 200
};

// Required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_USER',
  'DB_DATABASE',
  'MIDTRANS_SERVER_KEY',
  'MIDTRANS_CLIENT_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

// Validate environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

console.log('✅ Environment variables validated');
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Security Middleware
app.use(helmet()); // Security headers

// CORS
app.use(cors());
app.use(cors(corsOptions));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Global API Rate Limiter
app.use('/api/', apiLimiter);

app.get('/', (req, res) => {
  res.send('<h1>Backend sampun aktif</h1>');
});

// Routes with specific rate limiters
app.use('/api/auth', authLimiter, authRoutes); // Strict limiter for auth
app.use('/api/payment', paymentLimiter, paymentRoutes); // Payment limiter

// Other routes (covered by global apiLimiter)
app.use('/api/legit-check', legitCheckRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/config', configRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
    details: err
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server backend wonten ten http://localhost:${PORT}`);
});