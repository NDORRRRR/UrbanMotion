const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'urbanmotion_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

pool.promise().getConnection()
  .then(connection => {
    console.log('🔌 Sukses terkoneksi ke database MySQL!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error koneksi ke database!', err.message);
    process.exit(1); // Exit jika DB tidak konek
  });

module.exports = pool.promise();