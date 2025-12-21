const db = require('../config/db');

exports.getAllThreads = async (req, res) => {
  try {
    const query = `
      SELECT t.*, u.username, t.contact_number,
      GROUP_CONCAT(fti.image_url) as images
      FROM forum_threads t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN forum_thread_images fti ON t.id = fti.thread_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;
    const [rows] = await db.query(query);

    const threads = rows.map(row => ({
      ...row,
      images: row.images ? row.images.split(',') : []
    }));

    res.json(threads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal ambil forum.' });
  }
};

exports.getThreadDetail = async (req, res) => {
  const { id } = req.params;
  try {
    // Ambil Thread + Gambarnya
    const [threads] = await db.query(
      `SELECT t.*, u.username, t.contact_number, GROUP_CONCAT(fti.image_url) as images
       FROM forum_threads t 
       JOIN users u ON t.user_id = u.id 
       LEFT JOIN forum_thread_images fti ON t.id = fti.thread_id
       WHERE t.id = ? GROUP BY t.id`,
      [id]
    );

    if (threads.length === 0) return res.status(404).json({ message: 'Thread tidak ditemukan' });

    // Format gambar
    const threadData = {
      ...threads[0],
      images: threads[0].images ? threads[0].images.split(',') : []
    };

    const [replies] = await db.query(
      `SELECT r.*, u.username FROM forum_replies r JOIN users u ON r.user_id = u.id WHERE r.thread_id = ? ORDER BY r.created_at ASC`,
      [id]
    );

    threadData.replies = replies;
    res.json(threadData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error.' });
  }
};

exports.createThread = async (req, res) => {
  const { title, content, category } = req.body;
  const userId = req.user.id;
  const files = req.files; // Ambil BANYAK file

  if (!title || !content) return res.status(400).json({ message: 'Judul dan Isi wajib diisi!' });

  try {
    const [result] = await db.query(
      `INSERT INTO forum_threads(user_id, title, content, category, contact_number) VALUES(?, ?, ?, ?, ?)`,
      [userId, title, content, category || 'discussion', req.body.contact_number || null]
    );
    const threadId = result.insertId;

    if (files && files.length > 0) {
      for (const file of files) {
        const imageUrl = file.path; // Use Cloudinary URL
        await db.query(
          `INSERT INTO forum_thread_images(thread_id, image_url) VALUES(?, ?)`,
          [threadId, imageUrl]
        );
      }
    }

    res.status(201).json({ message: 'Thread berhasil dibuat!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal posting.' });
  }
};

exports.createReply = async (req, res) => {
  const { content } = req.body;
  const { id } = req.params; // Thread ID
  const userId = req.user.id;

  if (!content) return res.status(400).json({ message: 'Komentar tidak boleh kosong.' });

  try {
    await db.query(
      `INSERT INTO forum_replies(thread_id, user_id, content) VALUES(?, ?, ?)`,
      [id, userId, content]
    );
    res.status(201).json({ message: 'Komentar terkirim!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal kirim komentar.' });
  }
};

exports.deleteThread = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role; // Get user role

  try {
    // Cek dulu thread punya siapa
    const [threads] = await db.query('SELECT user_id FROM forum_threads WHERE id = ?', [id]);

    if (threads.length === 0) return res.status(404).json({ message: 'Thread tidak ditemukan.' });

    // Cek Ownership OR Admin privilege
    if (threads[0].user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Anda tidak berhak menghapus thread ini.' });
    }

    await db.query('DELETE FROM forum_threads WHERE id = ?', [id]);
    res.json({ message: 'Thread berhasil dihapus.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus thread.' });
  }
};