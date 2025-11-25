const axios = require('axios');
const db = require('../config/db');
require('dotenv').config();

const MIDTRANS_BASE_URL = 'https://app.sandbox.midtrans.com/snap/v1/transactions';
const MIDTRANS_AUTH = Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64');

exports.createTransaction = async (req, res) => {
  const userId = req.user.id;
  const { shipping_address, payment_method, total_amount, items } = req.body;

  if (items.length === 0 || !shipping_address) {
    return res.status(400).json({ message: 'Keranjang dan alamat pengiriman wajib diisi.' });
  }

  const orderId = `UM-${Date.now()}-${userId}`;

  try {
    const midtransPayload = {
        transaction_details: {
            order_id: orderId,
            gross_amount: total_amount,
        },
        credit_card: {
            secure: true,
        },
        item_details: items.map(item => ({
            id: item.product_id,
            price: item.price,
            quantity: item.quantity,
            name: item.name.substring(0, 50), // Midtrans batas nama 50 karakter
        })),
        customer_details: {
            email: req.user.email,
            username: req.user.username,
        }
    };
    
    const midtransResponse = await axios.post('https://api.sandbox.midtrans.com/v2/transactions', midtransPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Autentikasi menggunakan Server Key
        'Authorization': `Basic ${MIDTRANS_AUTH}`, 
      }
    });
    
    const [orderResult] = await db.query(
        `INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, payment_status, order_status) 
         VALUES (?, ?, ?, ?, 'pending', 'new')`,
        [userId, total_amount, shipping_address, payment_method]
    );
    const orderIdDb = orderResult.insertId;

    for (const item of items) {
        await db.query(
            `INSERT INTO order_items (order_id, product_id, seller_id, quantity, price_at_purchase) 
             VALUES (?, ?, ?, ?, ?)`,
            [orderIdDb, item.product_id, item.seller_id, item.quantity, item.price]
        );
    }
    
    res.json({ 
        message: 'Order dibuat, siap bayar!',
        snap_token: midtransResponse.data.token, // Token yang akan membuka pop-up pembayaran
        orderId: orderIdDb
    });

  } catch (error) {
    console.error('Error saat checkout:', error.response?.data || error.message);
    res.status(500).json({ message: 'Gagal memproses pembayaran. Cek log server.' });
  }
};