const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*, u.username as seller_name,
        GROUP_CONCAT(pi.image_url) as images
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    const [rows] = await db.query(query);

    const products = rows.map(row => ({
      ...row,
      images: row.images ? row.images.split(',') : []
    }));

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data produk.' });
  }
};

exports.createProduct = async (req, res) => {
  const { name, brand, price, description, stock, sizes } = req.body;
  const sellerId = req.user.id;
  const files = req.files; // Ambil BANYAK file

  if (!name || !brand || !price) return res.status(400).json({ message: 'Data tidak lengkap!' });
  if (!files || files.length === 0) return res.status(400).json({ message: 'Minimal 1 foto wajib!' });

  try {
    const [result] = await db.query(
      `INSERT INTO products (seller_id, name, brand, price, description, stock, sizes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sellerId, name, brand, price, description, stock || 1]
    );
    const productId = result.insertId;

    for (const file of files) {
      const imageUrl = `http://localhost:3001/uploads/${file.filename}`;
      await db.query(
        `INSERT INTO product_images (product_id, image_url) VALUES (?, ?)`,
        [productId, imageUrl]
      );
    }

    res.status(201).json({ message: 'Produk berhasil dijual!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menyimpan produk.' });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        p.*, u.username as seller_name,
        GROUP_CONCAT(pi.image_url) as images
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = ?
      GROUP BY p.id
    `;
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    const product = rows[0];
    // Ubah string images jadi array
    product.images = product.images ? product.images.split(',') : [];

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error.' });
  }
};