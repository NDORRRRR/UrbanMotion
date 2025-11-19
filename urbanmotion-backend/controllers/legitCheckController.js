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
      const imageUrl = `http://localhost:3001/uploads/${file.filename}`;

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
  const userId = req.user.id; // Ambil ID dari token login

  try {
    const query = `
      SELECT 
        lc.id, lc.sneaker_name, lc.status, lc.result, lc.created_at,
        GROUP_CONCAT(lci.image_url) as images
      FROM legit_checks lc
      LEFT JOIN legit_check_images lci ON lc.id = lci.legit_check_id
      WHERE lc.user_id = ?
      GROUP BY lc.id, lc.sneaker_name, lc.status, lc.result, lc.created_at
      ORDER BY lc.created_at DESC
    `;

    const [rows] = await db.query(query, [userId]);

    const formattedRows = rows.map(row => ({
      ...row,
      images: row.images ? row.images.split(',') : []
    }));

    res.json(formattedRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil riwayat.' });
  }
};