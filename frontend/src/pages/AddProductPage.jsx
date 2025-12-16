import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function AddProductPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState([]);
  const [sizes, setSizes] = useState('');

  const handleImageChange = (e) => {
    if (e.target.files) {
      setImage(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('brand', brand);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('sizes', sizes);
    
    image.forEach((file) => {
        formData.append('images', file);
    });

    try {
      await api.post('/products', formData);
      alert('Produk berhasil dijual!');
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal upload produk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: '600px', marginTop: '2rem' }}>
      <h2 style={{ color: 'var(--main-red)', textAlign: 'center' }}>Jual Sepatu Baru</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nama Sepatu</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required 
            placeholder="Nike Air Jordan 1 High"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Brand</label>
            <input
              type="text"
              value={brand}
              onChange={e => setBrand(e.target.value)}
              required 
              placeholder="Nike"
            />
          </div>
          <div className="form-group">
            <label>Harga (Rp)</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required 
              placeholder="2500000"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Pilihan Ukuran (Pisahkan dengan koma)</label>
          <input 
            type="text" 
            value={sizes} 
            onChange={e => setSizes(e.target.value)} 
            required 
            placeholder="Contoh: 39, 40, 41, 42, 43" 
          />
        </div>

        <div className="form-group">
          <label>Deskripsi & Kondisi</label>
          <textarea 
            value={description}
            onChange={e => setDescription(e.target.value)} 
            rows="4"
          ></textarea>
        </div>

        <div className="form-group">
          <label>Foto Produk (Maksimal 6)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange} 
            required
          />
          <small style={{color:'var(--text-muted)', display: 'block', marginTop: '5px'}}>
            Tahan CTRL untuk memilih banyak foto sekaligus.
          </small>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Mengupload...' : 'Jual Sekarang'}
        </button>
      </form>
    </div>
  );
}

export default AddProductPage;