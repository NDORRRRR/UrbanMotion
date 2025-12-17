import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LegitCheckPage.css';

function LegitCheckPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [sneakerName, setSneakerName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Batasi maksimal 10 file
    if (files.length > 10) {
      alert("Maksimal 10 foto saja, Bos!");
      return;
    }

    setSelectedFiles(files);

    // Buat URL Preview agar gambar muncul di layar sebelum di-upload
    const filePreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(filePreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Cek Login Dulu
    if (!token) {
      alert("Bos harus login dulu sebelum submit!");
      navigate('/login');
      return;
    }

    if (selectedFiles.length === 0) {
      setMessage({ type: 'error', text: 'Wajib upload minimal 1 foto sepatu!' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      
      formData.append('sneaker_name', brand);
      
      selectedFiles.forEach((file) => {
        formData.append('images', file); 
      });

      // Kirim ke Backend!
      const response = await api.post('/legit-check/submit', formData);

      setMessage({ type: 'success', text: 'Berhasil! Foto sepatu Bos sedang direview admin.' });
      
      // Reset Form
      setSneakerName('');
      setSelectedFiles([]);
      setPreviewUrls([]);

    } catch (err) {
      console.error("Upload error:", err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Gagal upload. Coba lagi, Bos.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lc-container">
      <h2 className="lc-header">Submit Legit Check</h2>

      {/* Tampilkan Pesan Sukses/Error */}
      {message && (
        <div className={`alert-box ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* Input Nama Sepatu */}
        <div className="lc-form-group">
          <label className="lc-label">Nama Sepatu (Brand & Model)</label>
          <input 
            type="text" 
            className="lc-input"
            placeholder="Contoh: Nike Air Jordan 1 Chicago"
            value={sneakerName}
            onChange={(e) => setSneakerName(e.target.value)}
            required
          />
        </div>

        {/* Input Upload Gambar */}
        <div className="lc-form-group">
          <label className="lc-label">Foto-foto Sepatu (Max 10)</label>
          
          {/* Area Klik Upload */}
          <div className="upload-area">
            <input 
              type="file" 
              multiple
              accept="image/*" // Hanya gambar
              onChange={handleFileChange}
              style={{ display: 'none' }} 
              id="file-upload"
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer', width: '100%', display:'block' }}>
              📂 Klik di sini untuk pilih foto (Insole, Box, Tag, dll)
            </label>
          </div>

          {/* Preview Gambar */}
          <div className="image-preview-grid">
            {previewUrls.map((url, index) => (
              <div key={index} className="preview-item">
                <img src={url} alt="Preview" />
              </div>
            ))}
          </div>
        </div>

        {/* Tombol Submit */}
        <button 
          type="submit" 
          className="btn-primary" 
          style={{ width: '100%', padding: '15px', fontSize: '1rem' }}
          disabled={loading}
        >
          {loading ? 'Mengirim Data...' : 'Kirim untuk Legit Check'}
        </button>

      </form>
    </div>
  );
}

export default LegitCheckPage;