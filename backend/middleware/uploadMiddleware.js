const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Simpan di folder 'uploads' yang tadi kita buat
    cb(null, 'public/uploads'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, prefixName + '-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  // Cek ekstensi dan tipe file
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (jpeg, jpg, png, webp) yang diperbolehkan!'));
  }
};

const uploadProduct = multer({ 
  storage: createStorage('product'),
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5MB per file
  fileFilter: fileFilter
});

const uploadLegit = multer({ 
  storage: createStorage('legit'),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

module.exports = upload;