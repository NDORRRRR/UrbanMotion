const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { validateRegister } = require('../middleware/validateInput');

// Jika ada request POST ke /api/auth/register, jalankan fungsi register
router.post('/register', validateRegister, authController.register);

// Jika ada request POST ke /api/auth/login, jalankan fungsi login
router.post('/login', authController.login);

module.exports = router;