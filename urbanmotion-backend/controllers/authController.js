require('dotenv').config(); 
const db = require('../config/db'); // "Colokan" database kita
const bcrypt = require('bcryptjs'); // "Mesin Enkripsi" password
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// --- FUNGSI REGISTER ---
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, Email dan password tidak boleh kosong' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // `password_hash`, bukan `password`
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: 'Registrasi berhasil!', userId: result.insertId });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username Email sudah terdaftar.' });
    }
    console.error('Error di register:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- FUNGSI LOGIN ---
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password tidak boleh kosong' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Email tidak ditemukan.' });
    }

    const user = users[0]; // Ambil data user itu

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Password salah.' });
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role // Penting untuk admin/reseller nanti
      }
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Tiket berlaku 1 jam

    res.json({
      message: 'Login sukses!',
      token: token,
      user: payload.user // Kita kirim data user juga
    });

  } catch (error) {
    console.error('Error di login:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};