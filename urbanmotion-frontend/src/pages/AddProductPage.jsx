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
    
    image.forEach((file) => {
        formData.append('images', file);
    });

    try {
      await api.post('/products', formData);
      alert('Produk berhasil dijual!');
      navigate('/'); // Balik ke Home
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
            required placeholder="Nike Air Jordan 1 High"
            style={{ width: '95%', padding: '8px' }}
        />
        </div>

        <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>Brand</label>
            <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                required placeholder="Nike"
                style={{ width: '95%', padding: '8px' }}
            />
          </div>
          <div>
            <label>Harga (Rp)</label>
            <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required placeholder="2500000"
                style={{ width: '95%', padding: '8px' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Deskripsi & Kondisi</label>
          <textarea 
            value={description}
            onChange={e => setDescription(e.target.value)} 
            rows="4" 
            style={{ width: '96%', padding: '8px', borderColor: 'var(--main-grey)', borderRadius: '6px' }}
          ></textarea>
        </div>

        <div className="form-group">
          <label>Foto Produk Utama</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange} 
            required
            style={{ width: '90%', padding: '6px' }}
        />
        <small style={{color:'#666'}}>Tahan CTRL untuk memilih banyak foto sekaligus.</small>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Mengupload...' : 'Jual Sekarang'}
        </button>
      </form>
    </div>
  );
}

export default AddProductPage;