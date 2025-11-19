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

  if (!thread) return <p style={{textAlign:'center', marginTop:'2rem'}}>Loading...</p>;

  return (
    <div className="forum-container">
      {/* Detail Thread Utama */}
      <div className="thread-detail">
        {thread.images.length > 0 && (
          <div style={{margin:'20px 0', display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'center'}}>
            {thread.images.map((imgUrl, index) => (
              <a key={index} href={imgUrl} target="_blank" rel="noreferrer">
                 <img src={imgUrl} alt={`Lampiran ${index+1}`} style={{maxWidth:'100%', maxHeight:'250px', borderRadius:'8px'}} />
              </a>
            ))}
          </div>
        )}
        <div className="thread-meta">
          <span className="thread-author">@{thread.username}</span> • 
          <span> {new Date(thread.created_at).toLocaleDateString()}</span>
        </div>
        <h1 style={{marginTop:'10px'}}>{thread.title}</h1>
        <div className="thread-content">{thread.content}</div>
      </div>

      {/* List Komentar */}
      <h3 style={{borderBottom:'1px solid #ddd', paddingBottom:'10px'}}>Komentar ({thread.replies.length})</h3>
      <div className="comments-list">
        {thread.replies.map(reply => (
          <div key={reply.id} className="comment-card">
            <div className="thread-meta">
              <b>@{reply.username}</b> • {new Date(reply.created_at).toLocaleString()}
            </div>
            <p style={{marginTop:'5px'}}>{reply.content}</p>
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