const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
  try {
    const { search, brand, sort } = req.query;

    let query = `
      SELECT 
        p.*, 
        u.username as seller_name,
        COALESCE(SUBSTRING_INDEX(GROUP_CONCAT(pi.image_url), ',', 1), 'https://via.placeholder.com/300') AS image_url 
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
    `;

    let conditions = [];
    let params = [];

    // Filter Search
    if (search) {
      conditions.push("(p.name LIKE ? OR p.description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    // Filter Brand
    if (brand && brand !== 'All') {
      conditions.push("p.brand = ?");
      params.push(brand);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " GROUP BY p.id";

    // Sorting
    if (sort === 'lowest') {
      query += " ORDER BY p.price ASC";
    } else if (sort === 'highest') {
      query += " ORDER BY p.price DESC";
    } else {
      query += " ORDER BY p.created_at DESC";
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const sellerId = req.user.id;
    // Mengambil data dari body
    const { name, brand, price, description, stock, sizes, condition_status, category } = req.body;
    const files = req.files;

    // PERBAIKAN VALIDASI: Cek field wajib
    if (!name || !brand || !price || !condition_status) {
      return res.status(400).json({ message: 'Nama, Brand, Harga, dan Kondisi wajib diisi' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Minimal upload 1 foto produk' });
    }

    // Default value untuk field yang mungkin kosong
    const finalStock = stock || 1;
    const finalCategory = category || 'Sneakers'; 
    const finalSizes = sizes || 'All Size';

    // Insert Produk
    const [result] = await db.query(
      `INSERT INTO products (seller_id, name, brand, price, description, stock, sizes, condition_status, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sellerId, name, brand, price, description, finalStock, finalSizes, condition_status, finalCategory]
    );

    const productId = result.insertId;

    // Insert Foto Produk
    if (files && files.length > 0) {
        for (const file of files) {
          // Sesuaikan path jika pakai local upload atau cloud
          const imageUrl = `http://localhost:3001/uploads/${file.filename}`;
          await db.query(
            `INSERT INTO product_images (product_id, image_url) VALUES (?, ?)`,
            [productId, imageUrl]
          );
        }
    }

    res.status(201).json({ message: 'Produk berhasil dijual!', productId });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: 'Gagal menyimpan produk: ' + error.message });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        p.*, u.username as seller_name, u.profile_picture as seller_image,
        GROUP_CONCAT(pi.image_url) as images
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = ?
      GROUP BY p.id
    `;
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    // Konversi string images menjadi array
    const product = rows[0];
    product.images = product.images ? product.images.split(',') : [];

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};