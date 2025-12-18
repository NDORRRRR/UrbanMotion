const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'urban-motion-uploads', // Ubah nama folder jadi lebih general
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
    format: async (req, file) => 'avif', // Paksa convert ke avif untuk optimasi
    public_id: (req, file) => {
      const name = file.originalname.split('.')[0];
      return name + '-' + Date.now();
    }
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|avif|bmp)$/i;

  const isImageMime = file.mimetype.startsWith('image/');
  const isExtValid = allowedExtensions.test(file.originalname);

  if (isImageMime || isExtValid) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung! Harap upload gambar (JPG, PNG, AVIF, WEBP).'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Batas ukuran file 5MB
  }
});

module.exports = upload;