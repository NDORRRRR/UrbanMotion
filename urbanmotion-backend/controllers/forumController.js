const db = require('../config/db');

exports.getAllThreads = async (req, res) => {
  try {
    const query = `
      SELECT t.*, u.username, 
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
      `SELECT t.*, u.username, GROUP_CONCAT(fti.image_url) as images
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
      `INSERT INTO forum_threads (user_id, title, content, category) VALUES (?, ?, ?, ?)`,
      [userId, title, content, category || 'discussion']
    );
    const threadId = result.insertId;

    if (files && files.length > 0) {
      for (const file of files) {
        const imageUrl = `http://localhost:3001/uploads/${file.filename}`;
        await db.query(
          `INSERT INTO forum_thread_images (thread_id, image_url) VALUES (?, ?)`,
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
      `INSERT INTO forum_replies (thread_id, user_id, content) VALUES (?, ?, ?)`,
      [id, userId, content]
    );
    res.status(201).json({ message: 'Komentar terkirim!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal kirim komentar.' });
  }
};