const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
    try {
        // Get query params
        const { search, brand, sort } = req.query;

        // Build WHERE conditions
        let whereConditions = ['p.is_deleted = FALSE'];
        let queryParams = [];

        // Search filter (name or brand)
        if (search) {
            whereConditions.push('(p.name LIKE ? OR p.brand LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        // Brand filter
        if (brand && brand !== 'All') {
            whereConditions.push('p.brand = ?');
            queryParams.push(brand);
        }

        // Build ORDER BY clause
        let orderBy = 'p.created_at DESC'; // Default: newest
        if (sort === 'cheap') {
            orderBy = 'p.price ASC';
        } else if (sort === 'expensive') {
            orderBy = 'p.price DESC';
        }

        const query = `
      SELECT 
        p.*, 
        u.username as seller_name,
        SUBSTRING_INDEX(GROUP_CONCAT(pi.image_url ORDER BY pi.id), ',', 1) AS main_image
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY p.id
      ORDER BY ${orderBy}
    `;

        const [products] = await db.query(query, queryParams);

        // Optimize Cloudinary URLs for faster loading
        const optimizedProducts = products.map(product => {
            // Use main_image if available, otherwise fallback
            product.image_url = product.main_image || 'https://via.placeholder.com/300';

            // Transform Cloudinary URLs
            if (product.image_url && product.image_url.includes('cloudinary.com')) {
                product.image_url = product.image_url.replace(
                    '/upload/',
                    '/upload/w_400,h_400,c_fill,f_auto,q_auto/'
                );
            }

            return product;
        });

        res.json(optimizedProducts);
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ message: 'Gagal mengambil data produk.' });
    }
};

// Get Product By ID
exports.getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const [productRows] = await db.query(
            `SELECT p.*, u.username as seller_name 
       FROM products p 
       JOIN users u ON p.seller_id = u.id 
       WHERE p.id = ?`,
            [id]
        );

        if (productRows.length === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        }

        const product = productRows[0];

        const [images] = await db.query(
            'SELECT image_url FROM product_images WHERE product_id = ?',
            [id]
        );

        product.images = images.map(img => img.image_url);

        res.json(product);
    } catch (error) {
        console.error('Error getting product detail:', error);
        res.status(500).json({ message: 'Gagal mengambil detail produk.' });
    }
};

// Create Product
exports.createProduct = async (req, res) => {
    const { name, brand, price, stock, description } = req.body;
    const sellerId = req.user.id;
    const files = req.files; // From multer array

    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'Minimal upload 1 gambar!' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO products (name, brand, price, stock, description, seller_id, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [name, brand, price, stock, description, sellerId]
        );

        const productId = result.insertId;

        // Bulk insert images
        const imageValues = files.map(file => [productId, file.path]);

        await connection.query(
            `INSERT INTO product_images (product_id, image_url) VALUES ?`,
            [imageValues]
        );

        await connection.commit();
        res.status(201).json({ message: 'Produk berhasil ditambahkan!', productId });

    } catch (error) {
        await connection.rollback();
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Gagal menambah produk.' });
    } finally {
        connection.release();
    }
};

// Update Product
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, brand, price, stock, description } = req.body;
    const sellerId = req.user.id;

    try {
        // Verify ownership
        const [check] = await db.query('SELECT id FROM products WHERE id = ? AND seller_id = ?', [id, sellerId]);
        if (check.length === 0) {
            return res.status(403).json({ message: 'Anda tidak berhak mengedit produk ini.' });
        }

        await db.query(
            `UPDATE products 
       SET name = ?, brand = ?, price = ?, stock = ?, description = ?
       WHERE id = ?`,
            [name, brand, price, stock, description, id]
        );

        res.json({ message: 'Produk berhasil diupdate!' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Gagal update produk.' });
    }
};

// Delete Product (Soft Delete)
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    const sellerId = req.user.id;

    try {
        // Verify ownership or admin
        const [check] = await db.query('SELECT id FROM products WHERE id = ? AND seller_id = ?', [id, sellerId]);
        if (check.length === 0 && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Akses ditolak.' });
        }

        // Soft delete: set is_deleted flag instead of deleting
        await db.query('UPDATE products SET is_deleted = TRUE WHERE id = ?', [id]);

        res.json({ message: 'Produk berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Gagal menghapus produk.' });
    }
};
