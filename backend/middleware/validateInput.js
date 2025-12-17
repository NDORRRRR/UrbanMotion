const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  
  // Username validation
  if (!username || username.length < 3 || username.length > 20) {
    return res.status(400).json({ 
      message: 'Username harus 3-20 karakter' 
    });
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ 
      message: 'Username hanya boleh huruf, angka, dan underscore' 
    });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ 
      message: 'Format email tidak valid' 
    });
  }
  
  // Password validation
  if (!password || password.length < 6) {
    return res.status(400).json({ 
      message: 'Password minimal 6 karakter' 
    });
  }
  
  next();
};

const validateProduct = (req, res, next) => {
  const { name, brand, price, stock } = req.body;
  
  if (!name || name.length < 3) {
    return res.status(400).json({ 
      message: 'Nama produk minimal 3 karakter' 
    });
  }
  
  if (!brand) {
    return res.status(400).json({ 
      message: 'Brand wajib diisi' 
    });
  }
  
  if (!price || price <= 0) {
    return res.status(400).json({ 
      message: 'Harga harus lebih dari 0' 
    });
  }
  
  if (stock !== undefined && stock < 0) {
    return res.status(400).json({ 
      message: 'Stok tidak boleh negatif' 
    });
  }
  
  next();
};

module.exports = { validateRegister, validateProduct };