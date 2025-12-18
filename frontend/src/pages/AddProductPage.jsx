import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

function AddProductPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState([]);
  const [sizes, setSizes] = useState('');
  const [condition, setCondition] = useState('New');

  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      if (files.length > 6) {
        toast.error('Maksimal 6 foto!');
        return;
      }

      setImage(files);
      toast.success(`${files.length} foto siap diupload`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Nama produk wajib diisi!');
      return;
    }

    if (!brand) {
      toast.error('Pilih brand dulu!');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      toast.error('Harga harus lebih dari 0!');
      return;
    }

    if (image.length === 0) {
      toast.error('Upload minimal 1 foto produk!');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Mengupload produk...');

    const formData = new FormData();

    formData.append('name', name.trim());
    formData.append('brand', brand);
    formData.append('price', price);
    formData.append('description', description.trim());
    formData.append('sizes', sizes.trim() || 'All Size');
    formData.append('condition_status', condition);
    formData.append('category', 'Sneakers');
    formData.append('stock', '1');

    image.forEach((file) => {
      formData.append('images', file);
    });

    console.log('📦 Sending FormData:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    try {
      const response = await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Server Response:', response.data);

      toast.success('Produk berhasil dijual!', { id: toastId });

      // Reset form
      setName('');
      setBrand('');
      setPrice('');
      setDescription('');
      setImage([]);
      setSizes('');
      setCondition('New');

      // Redirect ke dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('❌ Upload Error:', error);
      console.error('❌ Error Response:', error.response?.data);

      const errorMsg = error.response?.data?.message
        || error.response?.data?.details
        || 'Gagal upload produk. Coba lagi!';

      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Toaster position="top-center" />

      <h2 style={{ color: 'var(--text-color)' }}>Jual Produk Baru</h2>

      <form onSubmit={handleSubmit} encType="multipart/form-data">

        <div className="form-group">
          <label>Nama Produk *</label>
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
            <label>Brand *</label>
            <select
              value={brand}
              onChange={e => setBrand(e.target.value)}
              required
            >
              <option value="">Pilih Brand</option>
              <option value="Nike">Nike</option>
              <option value="Adidas">Adidas</option>
              <option value="Jordan">Jordan</option>
              <option value="Puma">Puma</option>
              <option value="New Balance">New Balance</option>
              <option value="Vans">Vans</option>
              <option value="Converse">Converse</option>
              <option value="Reebok">Reebok</option>
              <option value="Asics">Asics</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label>Harga (Rp) *</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
              min="1000"
              placeholder="2500000"
            />
          </div>
        </div>

        <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Kondisi *</label>
            <select
              value={condition}
              onChange={e => setCondition(e.target.value)}
              required
            >
              <option value="New">Baru (New)</option>
              <option value="Used">Bekas (Used)</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label>Pilihan Ukuran</label>
            <input
              type="text"
              value={sizes}
              onChange={e => setSizes(e.target.value)}
              placeholder="Contoh: 40, 41, 42"
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Pisahkan dengan koma. Kosongkan jika "All Size"
            </small>
          </div>
        </div>

        <div className="form-group">
          <label>Deskripsi</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows="4"
            placeholder="Deskripsikan kondisi, keaslian, dan detail produk..."
          ></textarea>
        </div>

        <div className="form-group">
          <label>Foto Produk (Minimal 1, Maksimal 6) *</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            required
          />
          {image.length > 0 && (
            <small style={{ color: 'green', marginTop: '5px', display: 'block' }}>
              ✅ {image.length} foto terpilih
            </small>
          )}
          <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '5px' }}>
            Tahan CTRL (Windows) atau CMD (Mac) untuk memilih banyak foto sekaligus
          </small>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{ width: '100%', marginTop: '1rem', padding: '15px' }}
        >
          {loading ? '⏳ Mengupload...' : '✅ Jual Sekarang'}
        </button>
      </form>
    </div>
  );
}

export default AddProductPage;