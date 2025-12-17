const express = require('express');
const router = express.Router();

router.get('/midtrans-key', (req, res) => {
  res.json({ clientKey: process.env.MIDTRANS_CLIENT_KEY });
});

module.exports = router;