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
      WHERE 1=1
    `;

    let conditions = [];
    let params = [];

    // Filter Search (Name, Brand, or Description)
    if (search) {
      conditions.push("(p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Filter Brand
    if (brand && brand !== 'All') {
      conditions.push("p.brand = ?");
      params.push(brand);
    }

    // Non-deleted check (if you have soft delete, uncomment below)
    // conditions.push("p.is_deleted = 0");

    if (conditions.length > 0) {
      query += " AND " + conditions.join(" AND ");
    }

    query += " GROUP BY p.id";

    // Sorting
    if (sort === 'cheap') {
      query += " ORDER BY p.price ASC";
    } else if (sort === 'expensive') {
      query += " ORDER BY p.price DESC";
    } else if (sort === 'newest') {
      query += " ORDER BY p.created_at DESC";
    } else {
      query += " ORDER BY p.created_at DESC"; // Default
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error getAllProducts:', error);
    res.status(500).json({
      message: 'Server Error',
      error: error.message
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    console.log('📦 Request Body:', req.body);
    console.log('📷 Files:', req.files?.length);

    const sellerId = req.user.id;
    const { name, brand, price, description, stock, sizes, condition_status, category } = req.body;
    const files = req.files;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Nama produk wajib diisi' });
    }
    if (!brand || brand.trim() === '') {
      return res.status(400).json({ message: 'Brand wajib diisi' });
    }
    if (!price || parseFloat(price) <= 0) {
      return res.status(400).json({ message: 'Harga harus lebih dari 0' });
    }
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Upload minimal 1 foto' });
    }

    const finalStock = stock && parseInt(stock) > 0 ? parseInt(stock) : 1;
    const finalCategory = category && category.trim() !== '' ? category : 'Sneakers';
    const finalSizes = sizes && sizes.trim() !== '' ? sizes : 'All Size';
    const finalCondition = condition_status || 'New';
    const finalDescription = description && description.trim() !== '' ? description : '';

    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products'
    `);

    const columnNames = columns.map(col => col.COLUMN_NAME);
    console.log('✅ Available columns:', columnNames);

    // Build query berdasarkan kolom yang ada
    let insertColumns = ['seller_id', 'name', 'brand', 'price'];
    let insertValues = [sellerId, name.trim(), brand.trim(), parseFloat(price)];
    let insertPlaceholders = ['?', '?', '?', '?'];

    // Tambahkan kolom opsional jika ada
    if (columnNames.includes('description')) {
      insertColumns.push('description');
      insertValues.push(finalDescription);
      insertPlaceholders.push('?');
    }
    if (columnNames.includes('stock')) {
      insertColumns.push('stock');
      insertValues.push(finalStock);
      insertPlaceholders.push('?');
    }
    if (columnNames.includes('sizes')) {
      insertColumns.push('sizes');
      insertValues.push(finalSizes);
      insertPlaceholders.push('?');
    }
    if (columnNames.includes('condition_status')) {
      insertColumns.push('condition_status');
      insertValues.push(finalCondition);
      insertPlaceholders.push('?');
    }
    if (columnNames.includes('category')) {
      insertColumns.push('category');
      insertValues.push(finalCategory);
      insertPlaceholders.push('?');
    }

    const insertQuery = `
      INSERT INTO products (${insertColumns.join(', ')}) 
      VALUES (${insertPlaceholders.join(', ')})
    `;

    console.log('📝 Query:', insertQuery);
    console.log('📊 Values:', insertValues);

    const [result] = await db.query(insertQuery, insertValues);
    const productId = result.insertId;

    console.log('✅ Product Created ID:', productId);

    // ✅ INSERT IMAGES
    for (const file of files) {
      const imageUrl = file.path;
      await db.query(
        `INSERT INTO product_images (product_id, image_url) VALUES (?, ?)`,
        [productId, imageUrl]
      );
    }

    res.status(201).json({
      message: 'Produk berhasil dijual!',
      productId,
      imageCount: files.length
    });

  } catch (error) {
    console.error('❌ Create Product Error:', error);
    res.status(500).json({
      message: 'Gagal menyimpan produk',
      error: error.message,
      details: error.sqlMessage || 'Server error'
    });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    console.log('🔍 Fetching product ID:', id);

    // Simple query tanpa WHERE is_deleted
    const query = `
      SELECT 
        p.*, 
        u.username as seller_name, 
        GROUP_CONCAT(pi.image_url) as images
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = ?
      GROUP BY p.id
    `;

    console.log('📝 Query:', query);
    console.log('🔢 Param:', id);

    const [rows] = await db.query(query, [id]);

    console.log('📊 Query Result:', rows.length, 'row(s)');

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    const product = rows[0];

    // Parse images string to array
    product.images = product.images ? product.images.split(',') : [];

    console.log('✅ Product found:', product.name);

    res.json(product);

  } catch (error) {
    console.error('❌ Error getProductById:', error);
    console.error('❌ Error Code:', error.code);
    console.error('❌ SQL Message:', error.sqlMessage);

    res.status(500).json({
      message: 'Server Error',
      error: error.message,
      sqlMessage: error.sqlMessage
    });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, stock, brand, condition_status, category } = req.body;
  const sellerId = req.user.id;

  try {
    // 1. Cek kepemilikan produk
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (products.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    // Jika user bukan super admin (opsional) dan bukan pemilik produk
    if (products[0].seller_id !== sellerId) {
      return res.status(403).json({ message: 'Anda tidak berhak mengedit produk ini' });
    }

    // 2. Update Data
    // Kita buat array update dinamis
    let updates = [];
    let values = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (price) { updates.push('price = ?'); values.push(price); }
    if (description) { updates.push('description = ?'); values.push(description); }
    if (stock) { updates.push('stock = ?'); values.push(stock); }
    if (brand) { updates.push('brand = ?'); values.push(brand); }
    if (condition_status) { updates.push('condition_status = ?'); values.push(condition_status); }
    if (category) { updates.push('category = ?'); values.push(category); }

    if (updates.length > 0) {
      values.push(id); // Untuk WHERE id = ?
      const query = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
      await db.query(query, values);
    }

    res.json({ message: 'Produk berhasil diupdate' });

  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ message: 'Gagal update produk' });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  const sellerId = req.user.id;

  try {
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (products.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    if (products[0].seller_id !== sellerId) {
      return res.status(403).json({ message: 'Anda tidak berhak menghapus produk ini' });
    }

    // Soft Delete
    await db.query('UPDATE products SET is_deleted = 1 WHERE id = ?', [id]);

    res.json({ message: 'Produk berhasil dihapus' });

  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ message: 'Gagal hapus produk' });
  }
};