const db = require('../config/db');

// 1. Ambil Isi Keranjang User
exports.getCart = async (req, res) => {
  const userId = req.user.id;
  try {
    // KODE BARU: Tidak ada 'p.image_url', tapi pakai SUBSTRING_INDEX
    const query = `
      SELECT 
        c.product_id, c.quantity, 
        p.name, p.price, p.stock, 
        p.seller_id,  -- WAJIB ADA (Biar checkout tidak error 500)
        SUBSTRING_INDEX(GROUP_CONCAT(pi.image_url), ',', 1) AS image_url 
      FROM carts c
      JOIN products p ON c.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE c.user_id = ?
      GROUP BY 
        c.product_id, c.quantity, 
        p.name, p.price, p.stock, 
        p.seller_id
    `;
    const [items] = await db.query(query, [userId]);
    res.json(items);
  } catch (error) {
    console.error('Error saat getCart:', error);
    res.status(500).json({ message: 'Gagal mengambil keranjang. Cek log server.' });
  }
};

// 2. Tambah/Update Barang di Keranjang
exports.updateCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Data produk/kuantitas tidak valid.' });
  }

  try {
    // A. Cek Stok
    const [productRows] = await db.query('SELECT stock FROM products WHERE id = ?', [productId]);
    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }
    const availableStock = productRows[0].stock;

    if (quantity > availableStock) {
      return res.status(400).json({ message: `Stok hanya tersedia ${availableStock} unit.` });
    }

    // B. Update Database
    const [existing] = await db.query(
      `SELECT * FROM carts WHERE user_id = ? AND product_id = ?`,
      [userId, productId]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE carts SET quantity = ? WHERE user_id = ? AND product_id = ?`,
        [quantity, userId, productId]
      );
    } else {
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

// 3. Hapus Item
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