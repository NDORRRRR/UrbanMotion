const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'urban',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error koneksi ke database!', err);
    return;
  }
  console.log('🔌 Sukses terkoneksi ke database MySQL!');
  connection.release(); // Lepas koneksi
});

module.exports = pool.promise();