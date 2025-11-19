const db = require('../config/db');

exports.getCart = async (req, res) => {
  const userId = req.user.id;
  try {
    const query = `
      SELECT 
        c.product_id, c.quantity, p.name, p.price, p.stock,
        -- Ambil URL gambar pertama dari tabel images
        SUBSTRING_INDEX(GROUP_CONCAT(pi.image_url), ',', 1) AS image_url 
      FROM carts c
      JOIN products p ON c.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE c.user_id = ?
      -- Pastikan semua kolom yang dipilih di-GROUP BY
      GROUP BY c.product_id, c.quantity, p.name, p.price, p.stock 
    `;
    const [items] = await db.query(query, [userId]);
    res.json(items);
  } catch (error) {
    console.error('Error saat getCart:', error); // Log error asli
    res.status(500).json({ message: 'Gagal mengambil keranjang. Hubungi admin.' });
  }
};

exports.updateCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Data produk/kuantitas tidak valid.' });
  }

  try {
    // A. Cek Ketersediaan Stok
    const [productRows] = await db.query('SELECT stock FROM products WHERE id = ?', [productId]);
    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }
    const availableStock = productRows[0].stock;

    // B. VALIDASI STOK TERAKHIR
    if (quantity > availableStock) {
      return res.status(400).json({ message: `Stok hanya tersedia ${availableStock} unit.` });
    }

    // C. Cek apakah barang sudah ada di keranjang?
    const [existing] = await db.query(
      `SELECT * FROM carts WHERE user_id = ? AND product_id = ?`,
      [userId, productId]
    );

    if (existing.length > 0) {
      // Jika sudah ada, UPDATE quantity
      await db.query(
        `UPDATE carts SET quantity = ? WHERE user_id = ? AND product_id = ?`,
        [quantity, userId, productId]
      );
    } else {
      // Jika belum ada, INSERT baru
      await db.query(
        `INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)`,
        [userId, productId, quantity]
      );
    }

    res.json({ message: 'Keranjang berhasil diupdate.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal update keranjang.' });
  }
};

exports.removeItem = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    await db.query(
      `DELETE FROM carts WHERE user_id = ? AND product_id = ?`,
      [userId, productId]
    );
    res.json({ message: 'Item berhasil dihapus.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus item.' });
  }
};