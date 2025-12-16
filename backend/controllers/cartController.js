const db = require('../config/db');

exports.getCart = async (req, res) => {
  const userId = req.user.id;
  try {
    const query = `
      SELECT 
        c.product_id, c.quantity, c.size,
        p.name, p.price, p.stock, 
        p.seller_id,
        SUBSTRING_INDEX(GROUP_CONCAT(pi.image_url), ',', 1) AS image_url 
      FROM carts c
      JOIN products p ON c.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE c.user_id = ?
      GROUP BY 
        c.product_id, c.quantity, c.size,
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

exports.updateCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity, size } = req.body;

  if (!productId || !quantity || !size) {
    return res.status(400).json({ message: 'Pilih ukuran dulu, Bos!' });
  }

  try {
    // Cek Stok
    const [productRows] = await db.query('SELECT stock FROM products WHERE id = ?', [productId]);
    if (productRows.length === 0) return res.status(404).json({ message: 'Produk hilang.' });
    
    const availableStock = productRows[0].stock;
    if (quantity > availableStock) return res.status(400).json({ message: 'Stok habis.' });

    // Cek apakah barang DENGAN UKURAN SAMA sudah ada?
    const [existing] = await db.query(
      `SELECT * FROM carts WHERE user_id = ? AND product_id = ? AND size = ?`,
      [userId, productId, size]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE carts SET quantity = ? WHERE user_id = ? AND product_id = ? AND size = ?`,
        [quantity, userId, productId, size]
      );
    } else {
      await db.query(
        `INSERT INTO carts (user_id, product_id, quantity, size) VALUES (?, ?, ?, ?)`,
        [userId, productId, quantity, size]
      );
    }

    res.json({ message: 'Masuk keranjang!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal update keranjang.' });
  }
};

exports.removeItem = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const { size } = req.body;

  try {
    await db.query(
      `DELETE FROM carts WHERE user_id = ? AND product_id = ? AND size = ?`,
      [userId, productId, size]
    );
    res.json({ message: 'Item dihapus.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal hapus item.' });
  }
};