import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Forum.css';

function ForumPage() {
  const [threads, setThreads] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/forum')
      .then(res => setThreads(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h1 style={{ color: 'var(--main-dark)' }}>Forum Diskusi & Jual Beli</h1>
        <Link to="/forum/create" className="btn-create-thread">+ Buat Topik Baru</Link>
      </div>

      {threads.length === 0 ? (
        <p>Belum ada diskusi. Jadilah yang pertama!</p>
      ) : (
        threads.map(thread => (
          <div
            key={thread.id}
            className="thread-card"
            onClick={() => navigate(`/forum/${thread.id}`)}
          >
            {/* 1. Meta Data (Penulis, Tanggal, Kategori) */}
            <div className="thread-meta">
              <span className="thread-author">@{thread.username}</span> •
              <span> {new Date(thread.created_at).toLocaleDateString()}</span>
              <span className="thread-category">{thread.category === 'marketplace' ? '💰 Jual Beli' : '💬 Diskusi'}</span>
            </div>

            {/* 2. Konten Utama (Judul + Ringkasan + Gambar) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
              <div>
                <h3 style={{ margin: '0 0 10px 0' }}>{thread.title}</h3>
                <p style={{ color: '#555', margin: 0 }}>
                  {thread.content.substring(0, 100)}...
                </p>
              </div>

              {/* Tampilkan Thumbnail Gambar PERTAMA jika ada */}
              {thread.images && thread.images.length > 0 && (
                <img src={thread.images[0]} alt="Thumb" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ForumPage;