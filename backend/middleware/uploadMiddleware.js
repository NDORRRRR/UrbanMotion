const multer = require('multer');
const path = require('path');

const createStorage = (prefixName) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads'); // Pastikan folder 'uploads' ada di root backend
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, prefixName + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
};

// Filter hanya terima gambar
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (jpeg, jpg, png, webp) yang diperbolehkan!'));
  }
};

// Bikin 3 uploader berbeda
const uploadProduct = multer({ 
  storage: createStorage('product'),
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: fileFilter
});

const uploadLegit = multer({ 
  storage: createStorage('legit'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

const uploadForum = multer({ 
  storage: createStorage('forum'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// Export semua uploader
module.exports = {
  uploadProduct,
  uploadLegit,
  uploadForum
};