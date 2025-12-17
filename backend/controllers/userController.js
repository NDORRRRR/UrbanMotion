const db = require('../config/db');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const sql = 'SELECT id, username, email, role, phone, created_at FROM users WHERE id = ?';
    const [results] = await db.query(sql, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server Error fetching profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, phone } = req.body;

    if (!username || !email) {
      return res.status(400).json({ message: 'Username and Email are required' });
    }

    const sql = 'UPDATE users SET username = ?, email = ?, phone = ? WHERE id = ?';
    
    const [result] = await db.query(sql, [username, email, phone, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or no changes made' });
    }

    const [updatedUser] = await db.query(
      'SELECT id, username, email, role, phone, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({ 
      message: 'Profil berhasil diperbarui', 
      user: updatedUser[0] 
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username atau email sudah digunakan' });
    }
    
    res.status(500).json({ message: 'Gagal mengupdate profil', error: err.message });
  }
};

module.exports = {
  getProfile,
  updateProfile
};