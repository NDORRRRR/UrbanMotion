import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Forum.css';

function CreateThreadPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('discussion');
  const [images, setImages] = useState([]); 
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    // Ambil semua file (Max 5)
    setImages(Array.from(e.target.files).slice(0, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    
    images.forEach((file) => {
      formData.append('images', file); 
    });

    try {
      await api.post('/forum', formData);
      alert('Thread berhasil dibuat!');
      navigate('/forum');
    } catch (error) {
      alert('Gagal membuat thread. Pastikan sudah login.');
    }
  };

  return (
    <div className="form-container" style={{marginTop:'2rem'}}>
      <h2 style={{textAlign:'center', marginBottom:'1.5rem'}}>Buat Topik Baru</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Judul Topik</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Judul..." style={{ width: '95%', padding: '8px' }} />
        </div>
        <div className="form-group">
          <label>Kategori</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{width:'100%', padding:'10px'}}>
            <option value="discussion">Diskusi Umum</option>
            <option value="marketplace">Jual Beli (Second)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Isi Pesan</label>
          <textarea rows="6" value={content} onChange={e => setContent(e.target.value)} required style={{width:'95%', padding:'10px'}}></textarea>
        </div>
        
        <div className="form-group">
          <label>Gambar (Maksimal 5)</label>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleImageChange} 
          />
          {images.length > 0 && (
            <small style={{color:'green'}}>✅ {images.length} foto terpilih.</small>
          )}
        </div>

        <button type="submit" className="btn-primary" style={{width:'100%'}}>Posting</button>
      </form>
    </div>
  );
}

export default CreateThreadPage;