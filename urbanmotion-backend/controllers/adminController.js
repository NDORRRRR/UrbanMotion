const db = require('../config/db');

exports.getPendingChecks = async (req, res) => {
    try {
        const query = `
        SELECT
            lc.id, lc.sneaker_name, lc.created_at, lc.status,
            u.username, u.email,
            GROUP_CONCAT(lci.image_url) as images
        FROM legit_checks lc
        JOIN users u ON lc.user_id = u.id
        LEFT JOIN legit_check_images lci ON lc.id = lci.legit_check_id
        WHERE lc.status = 'pending'
        GROUP BY lc.id, lc.sneaker_name, lc.created_at, lc.status, u.username, u.email
        ORDER BY lc.created_at DESC
        `;

        const [rows] = await db.query(query);

        const formattedRows = rows.map(row => ({
            ...row,
            images: row.images ? row.images.split(',') : []
        }));

        res.json(formattedRows);
    }   catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error ambil data pending.' });
    }
};

exports.verifyCheck = async (req, res) => {
  const { id } = req.params; // ID legit check
  const { result } = req.body; // 'verified' atau 'fake'

  if (!['verified', 'fake'].includes(result)) {
    return res.status(400).json({ message: 'Hasil harus verified atau fake!' });
  }

  try {
    await db.query(
      `UPDATE legit_checks SET status = 'completed', result = ? WHERE id = ?`,
      [result, id]
    );
    res.json({ message: `Sukses! Status diubah menjadi ${result}.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal update status.' });
  }
};