const express = require('express');
const cors = require('cors');
const path = require('path');
require('./config/db.js');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const legitCheckRoutes = require('./routes/legitCheckRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const forumRoutes = require('./routes/forumRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes.js');
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

const requiredEnvVars = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_USER',
  'DB_DATABASE',
  'MIDTRANS_SERVER_KEY',
  'MIDTRANS_CLIENT_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/', (req, res) => {
    res.send('<h1>Backend sampun aktif</h1>');
});

app.use('/api/auth', authRoutes);
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

app.listen(PORT, () => {
    console.log(`🚀 Server backend wonten ten http://localhost:${PORT}`);
});