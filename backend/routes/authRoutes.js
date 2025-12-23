const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { validateRegister } = require('../middleware/validateInput');

router.post('/register', validateInput.validateRegistration, authController.register);

router.post('/login', authController.login);

module.exports = router;