const db = require('../config/db');

exports.submitLegitCheck = async (req, res) => {
  try {
    const { sneaker_name } = req.body;
    const userId = req.user.id;
    const files = req.files;

    if (!sneaker_name) {
      return res.status(400).json({ message: 'Nama sepatu wajib diisi!' });
    }
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Wajib upload minimal 1 foto!' });
    }

    const [result] = await db.query(
      `INSERT INTO legit_checks (user_id, sneaker_name, status, payment_status) 
       VALUES (?, ?, 'pending', 'pending')`,
      [userId, sneaker_name]
    );

    const legitCheckId = result.insertId;

    for (const file of files) {
      const imageUrl = file.path; // Use Cloudinary URL
      await db.query(
        `INSERT INTO legit_check_images (legit_check_id, image_url) VALUES (?, ?)`,
        [legitCheckId, imageUrl]
      );
    }

    res.status(201).json({
      message: 'Legit Check berhasil disubmit!',
      legitCheckId: legitCheckId
    });

  } catch (error) {
    console.error('Error submit legit check:', error);
    res.status(500).json({ message: 'Server Error saat upload.' });
  }
};

exports.getMyHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const query = `
      SELECT 
        lc.id, lc.sneaker_name, lc.status, lc.result, lc.created_at,
        GROUP_CONCAT(lci.image_url) as images
      FROM legit_checks lc
      LEFT JOIN legit_check_images lci ON lc.id = lci.legit_check_id
      WHERE lc.user_id = ?
      GROUP BY lc.id
      ORDER BY lc.created_at DESC
    `;

    const [rows] = await db.query(query, [userId]);

    const data = rows.map(item => ({
      ...item,
      images: item.images ? item.images.split(',') : []
    }));

    res.json(data);
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- TAMBAHAN YANG HILANG ---
exports.getLegitCheckById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        lc.*, 
        u.username,
        GROUP_CONCAT(lci.image_url) as images
      FROM legit_checks lc
      LEFT JOIN users u ON lc.user_id = u.id
      LEFT JOIN legit_check_images lci ON lc.id = lci.legit_check_id
      WHERE lc.id = ?
      GROUP BY lc.id
    `;

    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Data Legit Check tidak ditemukan' });
    }

    const data = rows[0];
    data.images = data.images ? data.images.split(',') : [];

    res.json(data);
  } catch (error) {
    console.error('Error get detail:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};