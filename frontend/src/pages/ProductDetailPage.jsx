import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeList, setSizeList] = useState([]);

  // Format Rupiah
  const formatRp = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data);
        if(res.data.images.length > 0) setActiveImage(res.data.images[0]);
        
        // Parse string size jadi array. Contoh: "39, 40, 41" -> ["39", "40", "41"]
        if (res.data.sizes) {
          const sizesArray = res.data.sizes.split(',').map(s => s.trim());
          setSizeList(sizesArray);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!token) {
      alert('Login dulu Bos!');
      navigate('/login');
      return;
    }
    
    // VALIDASI SIZE
    if (!selectedSize) {
      alert('Pilih ukuran sepatu dulu, Bos!');
      return;
    }

    try {
      await api.post('/cart', { 
        productId: product.id, 
        quantity: 1,
        size: selectedSize // Kirim size ke backend
      });
      alert(`Berhasil! Size ${selectedSize} masuk keranjang.`);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal nambah ke keranjang.');
    }
  };

  if (loading) return <p style={{textAlign:'center', marginTop:'5rem'}}>Loading...</p>;
  if (!product) return <p style={{textAlign:'center', marginTop:'5rem'}}>Produk tidak ditemukan.</p>;

  return (
    <div className="detail-container">
      <div className="gallery-container">
        <img src={activeImage} alt={product.name} className="main-image" />
        <div className="thumb-grid">
          {product.images.map((img, idx) => (
            <img 
              key={idx} src={img} alt="thumb" 
              className={`thumb-img ${activeImage === img ? 'active' : ''}`}
              onClick={() => setActiveImage(img)}
            />
          ))}
        </div>
      </div>

      <div className="product-info-section">
        <div className="detail-brand">{product.brand}</div>
        <h1>{product.name}</h1>
        <div className="detail-price">{formatRp(product.price)}</div>
        
        <div className="detail-seller">
           <span>🏪 Penjual: <strong>{product.seller_name}</strong></span>
           <span>📦 Stok: <strong>{product.stock}</strong></span>
        </div>

        {/* PILIHAN SIZE */}
        <div className="size-section" style={{marginBottom: '2rem'}}>
          <label style={{display:'block', fontWeight:'600', marginBottom:'10px', color:'var(--text-color)'}}>Pilih Ukuran:</label>
          <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
            {sizeList.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                style={{
                  padding: '10px 20px',
                  border: selectedSize === size ? '2px solid var(--main-red)' : '1px solid var(--border-color)',
                  backgroundColor: selectedSize === size ? 'var(--main-red)' : 'var(--card-bg)',
                  color: selectedSize === size ? 'white' : 'var(--text-color)',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  fontWeight: 'bold'
                }}
              >
                {size}
              </button>
            ))}
          </div>
          {!selectedSize && <small style={{color:'var(--main-red)', marginTop:'5px', display:'block'}}>* Wajib pilih satu</small>}
        </div>

        <div className="detail-desc">
          <h3>Deskripsi</h3>
          <p className="desc-text">{product.description}</p>
        </div>

        <div className="action-buttons">
          <button 
            className="btn-primary btn-buy-large" 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? '+ TAMBAHKAN KE KERANJANG' : 'STOK HABIS'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;