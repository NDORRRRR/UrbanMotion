const db = require('../config/db');

const getProfile = (req, res) => {
  const userId = req.user.id;

  const sql = 'SELECT id, username, email, role, phone, created_at FROM users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching profile:', err);
      return res.status(500).json({ message: 'Server Error fetching profile' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(results[0]);
  });
};

const updateProfile = (req, res) => {
  const userId = req.user.id;
  const { username, email, phone } = req.body;

  if (!username || !email) {
    return res.status(400).json({ message: 'Username and Email are required' });
  }

  const sql = 'UPDATE users SET username = ?, email = ?, phone = ? WHERE id = ?';
  
  db.query(sql, [username, email, phone, userId], (err, result) => {
    if (err) {
      console.error('Error updating profile:', err);
      return res.status(500).json({ message: 'Gagal mengupdate profil', error: err.message });
    }
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found or no changes made' });
    }

    const updatedUser = { 
        id: userId, 
        username, 
        email, 
        phone, 
        role: req.user.role,
        created_at: req.user.created_at 
    };
    
    res.json({ message: 'Profil berhasil diperbarui', user: updatedUser });
  });
};

// exports.updateProfile = async (req, res) => {
//   const { full_name, phone, address } = req.body;
//   try {
//     await db.query(
//       'UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?',
//       [full_name, phone, address, req.user.id]
//     );
//     res.json({ message: 'Profil berhasil diupdate!' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Gagal update profil.' });
//   }
// };

module.exports = {
  getProfile,
  updateProfile
};