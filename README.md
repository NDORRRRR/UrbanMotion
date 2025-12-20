# UrbanMotion 🏃‍♂️👟

> Platform E-Commerce Sneakers Premium dengan Fitur Forum Sneakerhead dan Legit Check

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-urbanmotion.web.id-ff4444?style=for-the-badge)](https://urbanmotion.web.id)
[![Status](https://img.shields.io/badge/Status-Online-success?style=for-the-badge)](https://urbanmotion.web.id)

---

## 📋 Deskripsi

UrbanMotion adalah platform e-commerce modern yang mengkhususkan diri dalam penjualan sepatu sneakers premium. Platform ini menggabungkan fitur marketplace dengan komunitas sneakerhead melalui forum diskusi dan layanan legit check untuk memastikan keaslian produk.

### Fitur Utama

#### 🛒 **E-Commerce**
- Katalog produk sneakers dengan filter & search
- Sistem keranjang belanja (shopping cart)
- Multiple seller support (marketplace model)
- Size selection & stock management
- Image optimization (Cloudinary + lazy loading)
- Product image management (add/edit/delete)

#### 💳 **Payment & Orders**
- Integrasi Midtrans Payment Gateway
- Multiple payment methods (credit card, e-wallet, bank transfer)
- Order tracking dengan resi otomatis
- Order status management (new → processing → shipped → delivered)
- Order history untuk buyer & seller
- Auto revenue calculation untuk seller

#### 👤 **User Management**
- Authentication (Register, Login, JWT)
- Multi-role system (Buyer, Seller, Admin)
- User profile management
- Seller dashboard dengan analytics

#### 📊 **Seller Dashboard**
- Real-time statistics (products, orders, revenue, pending orders)
- Product management (CRUD)
- Order management dengan status update
- Revenue tracking otomatis
- Image gallery management

#### 💬 **Forum Sneakerhead**
- Diskusi komunitas sneakers
- Thread & reply system
- User engagement

#### ✅ **Legit Check Service**
- Request authentication untuk sepatu
- Upload multiple images
- Expert review system
- Payment integration untuk service premium

#### 🔒 **Security & Performance**
- Rate limiting (3-tier: API, Auth, Payment)
- Helmet security headers
- Winston logging (error & combined logs)
- Global error handler
- Environment validation
- Soft delete untuk data preservation
- Image optimization via Cloudinary transformations

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js
- **Routing:** React Router DOM
- **State Management:** React Context API
- **Styling:** Vanilla CSS
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast
- **Payment UI:** Midtrans Snap

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer + Cloudinary
- **Payment:** Midtrans API
- **Security:** 
  - Helmet (security headers)
  - express-rate-limit (API protection)
  - bcrypt (password hashing)
- **Logging:** Winston
- **Email:** Nodemailer (optional)

### Infrastructure
- **Image Storage:** Cloudinary
- **Payment Gateway:** Midtrans Sandbox/Production
- **Deployment:** VPS / Cloud Hosting

---

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn
- Cloudinary account
- Midtrans account (sandbox for testing)

### 1. Clone Repository
```bash
git clone https://github.com/NDORRRRR/UrbanMotion.git
cd UrbanMotion
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=urbanmotion

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Midtrans
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Environment
NODE_ENV=development
```

### 3. Database Setup

Import database schema:
```bash
mysql -u root -p urbanmotion < database/urban.sql
```

**Note:** `urban.sql` includes sample data. For production, truncate tables after import:
```sql
USE urbanmotion;
TRUNCATE TABLE products;
TRUNCATE TABLE product_images;
TRUNCATE TABLE orders;
TRUNCATE TABLE order_items;
TRUNCATE TABLE carts;
TRUNCATE TABLE forum_threads;
TRUNCATE TABLE forum_replies;
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Update API base URL in `src/services/api.js` if needed.

### 5. Run Development

**Backend:**
```bash
cd backend
npm run dev
# or
node index.js
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---

## 🚀 Deployment to Production

#### Method 1: Git Pull (Recommended)

```bash
# SSH ke server
ssh user@urbanmotion.web.id

# Navigate to project
cd /path/to/UrbanMotion

# Pull latest changes
git pull origin main

# Import/Update database
mysql -u root -p urbanmotion < database/urban.sql

# Update backend dependencies
cd backend
npm install

# Update frontend dependencies  
cd ../frontend
npm install

# Build frontend for production
npm run build

# Restart backend service
pm2 restart urbanmotion-backend

# Restart frontend (if using pm2 serve)
pm2 restart urbanmotion-frontend
```

#### Method 2: Manual Upload (FTP/SFTP)

1. Build frontend locally:
```bash
cd frontend
npm run build
```

2. Upload files via FTP/SFTP:
- Upload `backend/` folder
- Upload `frontend/dist/` folder (build result)

3. SSH to server and restart services:
```bash
pm2 restart all
```

### Environment Variables (Production)

Update `.env` di server dengan production credentials:
```env
NODE_ENV=production
FRONTEND_URL=https://urbanmotion.web.id
DB_HOST=production-db-host
MIDTRANS_SERVER_KEY=production-key
MIDTRANS_CLIENT_KEY=production-client-key
```

### Process Manager (PM2)

**Install PM2:**
```bash
npm install -g pm2
```

**Start Backend:**
```bash
cd backend
pm2 start index.js --name urbanmotion-backend
pm2 save
pm2 startup
```

**Serve Frontend (Static Build):**
```bash
pm2 serve frontend/dist 3000 --name urbanmotion-frontend --spa
pm2 save
```

**Useful PM2 Commands:**
```bash
pm2 list              # List all processes
pm2 logs              # View logs
pm2 restart all       # Restart all
pm2 stop all          # Stop all
pm2 delete all        # Delete all
```

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product detail
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product (seller)
- `DELETE /api/products/:id` - Delete product (seller)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders/:orderId/confirm-payment` - Confirm payment
- `POST /api/orders/item/:id/confirm` - Confirm order delivery
- `POST /api/orders/:id/cancel` - Cancel order

### Dashboard (Seller)
- `GET /api/dashboard/stats` - Get seller statistics
- `GET /api/dashboard/products` - Get seller products
- `GET /api/dashboard/orders` - Get seller orders
- `GET /api/dashboard/products/:id/images` - Get product images
- `POST /api/dashboard/products/:id/images` - Add product image
- `DELETE /api/dashboard/products/:productId/images/:imageId` - Delete image

### Checkout
- `POST /api/checkout` - Create transaction & get Midtrans token

### Forum
- `GET /api/forum` - Get forum threads
- `POST /api/forum` - Create thread
- `POST /api/forum/:id/reply` - Reply to thread

### Legit Check
- `POST /api/legit-check` - Submit legit check request
- `GET /api/legit-check` - Get user's legit check requests

See full API documentation in `/docs/api.md` (if available).

---

## 🔐 Security Features

1. **Rate Limiting**
   - General API: 100 req/15min
   - Auth endpoints: 5 req/15min
   - Payment endpoints: 10 req/15min

2. **Security Headers** (via Helmet)
   - X-Content-Type-Options
   - X-Frame-Options
   - X-XSS-Protection
   - HSTS

3. **Input Validation**
   - Server-side validation for all inputs
   - SQL injection prevention via parameterized queries

4. **Password Security**
   - bcrypt hashing with salt rounds

5. **JWT Authentication**
   - Secure token-based auth
   - Token expiration

---

## 📝 License

This project is private and proprietary.

---

## 👥 Contributors

- **Developer:** Adhim Musafak
- **Website:** [urbanmotion.web.id](https://urbanmotion.web.id)

---

## 📞 Support

For issues or questions:
- Email: adhimreko@gmail.com
- Website: https://urbanmotion.web.id

---

## 🎯 Roadmap

- [ ] Push notifications
- [ ] Email verification
- [ ] Social media login (Google, Facebook)
- [ ] Product reviews & ratings
- [ ] Wishlist functionality
- [ ] Advanced search filters
- [ ] Mobile app (React Native)

---

**Made with ❤️ for Sneakerheads**
