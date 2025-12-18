import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Forum.css';

function ThreadDetailPage() {
  const { id } = useParams(); // Ambil ID dari URL
  const { token } = useAuth();
  const [thread, setThread] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  // Ambil Data Thread + Komentar
  const fetchThread = async () => {
    try {
      const res = await api.get(`/forum/${id}`);
      setThread(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchThread();
  }, [id]);

  // Kirim Komentar
  const handleReply = async (e) => {
    e.preventDefault();
    if (!token) return alert('Login dulu bos buat komen!');

    try {
      await api.post(`/forum/${id}/reply`, { content: replyContent });
      setReplyContent(''); // Kosongkan form
      fetchThread(); // Refresh data biar komentar baru muncul
    } catch (error) {
      alert('Gagal kirim komentar.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Yakin ingin menghapus thread ini?')) return;
    try {
      await api.delete(`/forum/${id}`);
      alert('Thread berhasil dihapus.');
      window.location.href = '/forum';
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus thread.');
    }
  };

  if (!thread) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>;

  return (
    <div className="forum-container">
      {/* Detail Thread Utama */}
      <div className="thread-detail">
        {thread.images.length > 0 && (
          <div style={{ margin: '20px 0', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {thread.images.map((imgUrl, index) => (
              <a key={index} href={imgUrl} target="_blank" rel="noreferrer">
                <img src={imgUrl} alt={`Lampiran ${index + 1}`} style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px' }} />
              </a>
            ))}
          </div>
        )}
        <div className="thread-meta">
          <span className="thread-author">@{thread.username}</span> •
          <span> {new Date(thread.created_at).toLocaleDateString()}</span>
        </div>
        <h1 style={{ marginTop: '10px' }}>{thread.title}</h1>
        <div className="thread-content">{thread.content}</div>

        {/* ACTION BUTTONS */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          {/* Tombol WhatsApp (Hanya Marketplace) */}
          {thread.category === 'marketplace' && thread.contact_number && (
            <a
              href={`https://wa.me/${thread.contact_number}?text=Halo, saya tertarik dengan postingan Anda di Urban Motion: ${thread.title}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ backgroundColor: '#25D366', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              Start Chat (WA)
            </a>
          )}

          {/* Tombol Delete (Hanya Pemilik) */}
          {/* Note: Kita butuh user ID dari token/auth context untuk membandingkan. 
                Tapi karena 'user' object tidak terekspose langsung dari useAuth (cuma token), 
                kita asumsikan user bisa delete jika backend mengizinkan, atau kita decode token.
                Untuk amannya, kita coba tampilkan saja, backend yang akan tolak jika salah.
                IDEALNYA: simpan user info di context.
            */}
          <button
            onClick={handleDelete}
            className="btn-danger"
            style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Hapus Thread
          </button>
        </div>

      </div>

      {/* List Komentar */}
      <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Komentar ({thread.replies.length})</h3>
      <div className="comments-list">
        {thread.replies.map(reply => (
          <div key={reply.id} className="comment-card">
            <div className="thread-meta">
              <b>@{reply.username}</b> • {new Date(reply.created_at).toLocaleString()}
            </div>
            <p style={{ marginTop: '5px' }}>{reply.content}</p>
          </div>
        ))}
      </div>

      {/* Form Balas Komentar */}
      <div className="comments-section reply-form">
        <h4>Tulis Balasan</h4>
        <form onSubmit={handleReply}>
          <textarea
            placeholder="Tulis komentar sopan..."
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Kirim Balasan</button>
        </form>
      </div>
    </div>
  );
}

export default ThreadDetailPage;