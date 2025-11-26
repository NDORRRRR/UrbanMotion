const db = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, email, role, full_name, phone, address FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal ambil profil.' });
  }
};

exports.updateProfile = async (req, res) => {
  const { full_name, phone, address } = req.body;
  try {
    await db.query(
      'UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?',
      [full_name, phone, address, req.user.id]
    );
    res.json({ message: 'Profil berhasil diupdate!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal update profil.' });
  }
};