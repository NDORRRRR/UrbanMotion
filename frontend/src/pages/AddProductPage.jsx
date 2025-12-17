import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function AddProductPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState([]);
  const [sizes, setSizes] = useState('');
  const [condition, setCondition] = useState('New'); // Default value

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
    formData.append('condition_status', condition);

    formData.append('category', 'Sneakers'); 
    formData.append('stock', 1);
    
    image.forEach((file) => {
        formData.append('images', file);
    });

    try {
      await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Produk berhasil dijual!');
      navigate('/dashboard/seller');
    } catch (error) {
      console.error("Upload Error:", error);
      const msg = error.response?.data?.message || 'Gagal upload produk.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Jual Produk Baru</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        
        <div className="form-group">
          <label>Nama Produk</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            placeholder="Contoh: Air Jordan 1 High"
          />
        </div>

        <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Brand</label>
            <select value={brand} onChange={e => setBrand(e.target.value)} required>
                <option value="">Pilih Brand</option>
                <option value="Nike">Nike</option>
                <option value="Adidas">Adidas</option>
                <option value="Jordan">Jordan</option>
                <option value="Puma">Puma</option>
                <option value="New Balance">New Balance</option>
                <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="form-group" style={{ flex: 1 }}>
            <label>Harga (IDR)</label>
            <input 
              type="number" 
              value={price} 
              onChange={e => setPrice(e.target.value)} 
              required 
              placeholder="2500000"
            />
          </div>
        </div>

        <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
                <label>Kondisi</label>
                <select value={condition} onChange={e => setCondition(e.target.value)}>
                    <option value="New">Baru (New)</option>
                    <option value="Used">Bekas (Used)</option>
                </select>
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
                <label>Pilihan Ukuran (Pisahkan koma)</label>
                <input 
                    type="text" 
                    value={sizes} 
                    onChange={e => setSizes(e.target.value)} 
                    required 
                    placeholder="Contoh: 40, 41, 42" 
                />
            </div>
        </div>

        <div className="form-group">
          <label>Deskripsi</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows="4"
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label>Foto Produk (Minimal 1, Maksimal 5)</label>
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={handleImageChange} 
            required
          />
          <small style={{color:'#666'}}>Tahan tombol CTRL untuk memilih banyak foto sekaligus.</small>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
          {loading ? 'Mengupload...' : 'Jual Sekarang'}
        </button>
      </form>
    </div>
  );
}

export default AddProductPage;