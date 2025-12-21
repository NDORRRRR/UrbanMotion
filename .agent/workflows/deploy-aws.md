---
description: Panduan Deploy ke AWS Server
---

# Panduan Lengkap Deploy UrbanMotion ke AWS Server

Panduan ini berisi langkah-langkah lengkap untuk deploy aplikasi UrbanMotion (Frontend + Backend) ke AWS EC2 Server.

## Prasyarat
- Domain sudah terhubung ke IP server AWS (sudah selesai)
- File key pair AWS (urbanmotion.pem) sudah tersedia
- Akun AWS dengan EC2 instance yang sudah berjalan

---

## BAGIAN 1: PERSIAPAN SERVER AWS

### 1.1. Koneksi ke Server AWS
```bash
# Dari Windows, gunakan PowerShell atau CMD
# Pastikan file urbanmotion.pem ada di folder project
ssh -i urbanmotion.pem ubuntu@[IP-SERVER-AWS-ANDA]
```

> **Catatan:** Ganti `[IP-SERVER-AWS-ANDA]` dengan IP publik dari EC2 instance Anda

### 1.2. Update Sistem Operasi
```bash
# Update daftar paket
sudo apt update

# Upgrade semua paket yang terinstal
sudo apt upgrade -y
```

### 1.3. Install Node.js dan npm
```bash
# Install curl jika belum ada
sudo apt install curl -y

# Download dan install Node.js versi 20 LTS (Long Term Support)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install nodejs -y

# Verifikasi instalasi
node --version
npm --version
```

### 1.4. Install MySQL Server
```bash
# Install MySQL Server
sudo apt install mysql-server -y

# Jalankan script keamanan MySQL
sudo mysql_secure_installation
```

**Pengaturan MySQL Secure Installation:**
- VALIDATE PASSWORD COMPONENT: Pilih `Y` (Ya)
- Password Validation Policy: Pilih `1` (MEDIUM)
- New Password: Buat password yang kuat (catat password ini!)
- Remove anonymous users: Pilih `Y`
- Disallow root login remotely: Pilih `Y`
- Remove test database: Pilih `Y`
- Reload privilege tables: Pilih `Y`

### 1.5. Konfigurasi Database MySQL
```bash
# Login ke MySQL sebagai root
sudo mysql -u root -p
```

**Di dalam MySQL console, jalankan:**
```sql
-- Buat database untuk aplikasi
CREATE DATABASE urbanmotion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Buat user baru untuk aplikasi (ganti 'password_anda' dengan password yang kuat)
CREATE USER 'urbanmotion_user'@'localhost' IDENTIFIED BY 'password_anda';

-- Berikan semua hak akses ke database
GRANT ALL PRIVILEGES ON urbanmotion.* TO 'urbanmotion_user'@'localhost';

-- Terapkan perubahan
FLUSH PRIVILEGES;

-- Keluar dari MySQL
EXIT;
```

### 1.6. Install PM2 (Process Manager)
```bash
# Install PM2 secara global
sudo npm install -g pm2

# Verifikasi instalasi
pm2 --version
```

### 1.7. Install Nginx (Web Server)
```bash
# Install Nginx
sudo apt install nginx -y

# Enable Nginx untuk auto-start saat boot
sudo systemctl enable nginx

# Mulai Nginx
sudo systemctl start nginx

# Cek status Nginx
sudo systemctl status nginx
```

### 1.8. Install Git
```bash
# Install Git
sudo apt install git -y

# Verifikasi instalasi
git --version
```

---

## BAGIAN 2: DEPLOY APLIKASI

### 2.1. Clone Repository dari GitHub
```bash
# Pindah ke direktori home
cd ~

# Clone repository (ganti dengan URL repository Anda)
git clone https://github.com/NDORRRRR/UrbanMotion.git

# Masuk ke folder project
cd UrbanMotion
```

> **Catatan:** Jika repository private, Anda perlu setup SSH key atau Personal Access Token

### 2.2. Setup Backend

#### 2.2.1. Install Dependencies Backend
```bash
# Masuk ke folder backend
cd ~/UrbanMotion/backend

# Install semua dependencies
npm install
```

#### 2.2.2. Konfigurasi Environment Variables Backend
```bash
# Buat file .env
nano .env
```

**Isi file .env dengan konfigurasi berikut:**
```env
PORT=5000
DB_HOST=localhost
DB_USER=urbanmotion_user
DB_PASSWORD=password_anda
DB_NAME=urbanmotion

JWT_SECRET=your_jwt_secret_key_here_min_32_characters_long
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_IS_PRODUCTION=false

NODE_ENV=production
```

> **Simpan file:** Tekan `Ctrl + X`, lalu `Y`, lalu `Enter`

#### 2.2.3. Import Database Schema
```bash
# Import schema database (sesuaikan dengan file SQL Anda)
mysql -u urbanmotion_user -p urbanmotion < ~/UrbanMotion/database/schema.sql
```

#### 2.2.4. Jalankan Backend dengan PM2
```bash
# Jalankan backend dengan PM2
pm2 start index.js --name urbanmotion-backend

# Auto-restart PM2 saat server reboot
pm2 startup systemd

# Salin dan jalankan command yang muncul (contoh):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Simpan konfigurasi PM2
pm2 save
```

### 2.3. Setup Frontend

#### 2.3.1. Install Dependencies Frontend
```bash
# Masuk ke folder frontend
cd ~/UrbanMotion/frontend

# Install semua dependencies
npm install
```

#### 2.3.2. Konfigurasi Environment Variables Frontend
```bash
# Buat file .env
nano .env
```

**Isi file .env dengan konfigurasi berikut:**
```env
VITE_API_URL=https://api.namadomain.com
VITE_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

> **Ganti `namadomain.com` dengan domain Anda**
> **Simpan file:** Tekan `Ctrl + X`, lalu `Y`, lalu `Enter`

#### 2.3.3. Build Production Frontend
```bash
# Build aplikasi frontend untuk production
npm run build
```

---

## BAGIAN 3: KONFIGURASI NGINX

### 3.1. Konfigurasi Nginx untuk Frontend dan Backend

```bash
# Buat file konfigurasi Nginx untuk domain utama (frontend)
sudo nano /etc/nginx/sites-available/urbanmotion
```

**Isi dengan konfigurasi berikut:**
```nginx
server {
    listen 80;
    server_name namadomain.com www.namadomain.com;

    root /home/ubuntu/UrbanMotion/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

> **Ganti `namadomain.com` dengan domain Anda**
> **Simpan file:** Tekan `Ctrl + X`, lalu `Y`, lalu `Enter`

```bash
# Buat file konfigurasi Nginx untuk subdomain API (backend)
sudo nano /etc/nginx/sites-available/urbanmotion-api
```

**Isi dengan konfigurasi berikut:**
```nginx
server {
    listen 80;
    server_name api.namadomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

> **Ganti `api.namadomain.com` dengan subdomain API Anda**
> **Simpan file:** Tekan `Ctrl + X`, lalu `Y`, lalu `Enter`

### 3.2. Aktifkan Konfigurasi Nginx

```bash
# Buat symbolic link untuk mengaktifkan konfigurasi
sudo ln -s /etc/nginx/sites-available/urbanmotion /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/urbanmotion-api /etc/nginx/sites-enabled/

# Hapus konfigurasi default (opsional)
sudo rm /etc/nginx/sites-enabled/default

# Test konfigurasi Nginx
sudo nginx -t

# Jika test berhasil, restart Nginx
sudo systemctl restart nginx
```

---

## BAGIAN 4: INSTALL SSL CERTIFICATE (HTTPS)

### 4.1. Install Certbot
```bash
# Install Certbot dan plugin Nginx
sudo apt install certbot python3-certbot-nginx -y
```

### 4.2. Generate SSL Certificate
```bash
# Generate SSL certificate untuk domain utama
sudo certbot --nginx -d namadomain.com -d www.namadomain.com

# Generate SSL certificate untuk subdomain API
sudo certbot --nginx -d api.namadomain.com
```

**Ikuti instruksi Certbot:**
- Masukkan email address Anda
- Setujui Terms of Service
- Pilih apakah ingin redirect HTTP ke HTTPS (pilih `2` untuk redirect otomatis)

### 4.3. Auto-renewal SSL Certificate
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Certbot akan otomatis setup cron job untuk renewal
```

---

## BAGIAN 5: KONFIGURASI FIREWALL

### 5.1. Setup UFW (Uncomplicated Firewall)
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow OpenSSH

# Allow HTTP
sudo ufw allow 'Nginx HTTP'

# Allow HTTPS
sudo ufw allow 'Nginx HTTPS'

# Cek status firewall
sudo ufw status
```

### 5.2. Konfigurasi AWS Security Group
Di AWS Console, pastikan Security Group EC2 instance Anda mengizinkan:
- **Port 22** (SSH) dari IP Anda
- **Port 80** (HTTP) dari 0.0.0.0/0
- **Port 443** (HTTPS) dari 0.0.0.0/0

---

## BAGIAN 6: VERIFIKASI DAN TESTING

### 6.1. Cek Status Aplikasi
```bash
# Cek status backend
pm2 status

# Cek logs backend
pm2 logs urbanmotion-backend

# Cek status Nginx
sudo systemctl status nginx

# Cek status MySQL
sudo systemctl status mysql
```

### 6.2. Test Aplikasi
- Buka browser dan akses: `https://namadomain.com` (Frontend)
- Test API: `https://api.namadomain.com/api/health` (Backend)

---

## BAGIAN 7: PERINTAH MAINTENANCE

### 7.1. Update Aplikasi (Pull Changes dari Git)
```bash
# Masuk ke folder project
cd ~/UrbanMotion

# Pull changes dari Git
git pull origin main

# Update Backend
cd backend
npm install
pm2 restart urbanmotion-backend

# Update Frontend
cd ../frontend
npm install
npm run build
```

### 7.2. Monitoring Aplikasi
```bash
# Monitor logs real-time
pm2 logs urbanmotion-backend

# Monitor resource usage
pm2 monit

# Cek memory usage
free -h

# Cek disk usage
df -h
```

### 7.3. Backup Database
```bash
# Backup database
mysqldump -u urbanmotion_user -p urbanmotion > ~/backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database (jika diperlukan)
mysql -u urbanmotion_user -p urbanmotion < ~/backup_20250101_120000.sql
```

### 7.4. Restart Services
```bash
# Restart Backend
pm2 restart urbanmotion-backend

# Restart Nginx
sudo systemctl restart nginx

# Restart MySQL
sudo systemctl restart mysql
```

---

## TROUBLESHOOTING

### Error: Cannot connect to database
```bash
# Cek status MySQL
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Cek konfigurasi database di .env
nano ~/UrbanMotion/backend/.env
```

### Error: Backend tidak berjalan
```bash
# Cek logs PM2
pm2 logs urbanmotion-backend

# Restart backend
pm2 restart urbanmotion-backend
```

### Error: 502 Bad Gateway (Nginx)
```bash
# Cek apakah backend berjalan
pm2 status

# Cek logs Nginx
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Error: Permission denied
```bash
# Berikan permission yang tepat ke folder
sudo chown -R ubuntu:ubuntu ~/UrbanMotion
chmod -R 755 ~/UrbanMotion
```

---

## INFORMASI PENTING

### Port yang Digunakan:
- **Frontend:** Port 80/443 (via Nginx)
- **Backend:** Port 5000 (internal, di-proxy oleh Nginx)
- **MySQL:** Port 3306 (internal)

### File Konfigurasi Penting:
- Backend ENV: `~/UrbanMotion/backend/.env`
- Frontend ENV: `~/UrbanMotion/frontend/.env`
- Nginx Frontend: `/etc/nginx/sites-available/urbanmotion`
- Nginx Backend: `/etc/nginx/sites-available/urbanmotion-api`

### Lokasi Logs:
- PM2 Logs: `~/.pm2/logs/`
- Nginx Access: `/var/log/nginx/access.log`
- Nginx Error: `/var/log/nginx/error.log`
- MySQL Error: `/var/log/mysql/error.log`

---

**Selamat! Aplikasi UrbanMotion Anda sudah berhasil di-deploy ke AWS Server! 🚀**