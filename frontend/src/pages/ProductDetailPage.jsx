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
  const [quantity, setQuantity] = useState(1);
  const [sizeList, setSizeList] = useState([]);

  const formatRp = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data);
        if(res.data.images && res.data.images.length > 0) {
            setActiveImage(res.data.images[0]);
        } else {
            setActiveImage(res.data.image_url);
        }
        
        if (res.data.sizes) {
          const sizesArray = res.data.sizes.split(',').map(s => s.trim());
          setSizeList(sizesArray);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleQtyChange = (val) => {
    const newQty = quantity + val;
    if (newQty >= 1 && newQty <= (product.stock || 1)) {
        setQuantity(newQty);
    }
  };

  const handleTransaction = async (isDirectBuy) => {
    if (!token) {
      alert('Login dulu Bos!');
      navigate('/login');
      return;
    }
    
    if (!selectedSize) {
      alert('⚠️ Mohon pilih Variasi (Ukuran) terlebih dahulu.');
      return;
    }

    try {
      await api.post('/cart', { 
        productId: product.id, 
        quantity: quantity,
        size: selectedSize 
      });

      if (isDirectBuy) {
        navigate('/cart'); 
      } else {
        alert('✅ Produk berhasil dimasukkan ke Keranjang!');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memproses.');
    }
  };

  if (loading) return <p style={{textAlign:'center', marginTop:'5rem'}}>Memuat Produk...</p>;
  if (!product) return <p style={{textAlign:'center', marginTop:'5rem'}}>Produk tidak ditemukan.</p>;

  return (
    <div className="detail-page-wrapper">
      
      <div className="detail-container">
        
        <div className="gallery-container">
          <img src={activeImage} alt={product.name} className="main-image" />
          
          <div className="thumb-grid">
            {product.images && product.images.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`thumb-${idx}`} 
                className={`thumb-img ${activeImage === img ? 'active' : ''}`}
                onMouseEnter={() => setActiveImage(img)} // Ganti gambar pas di-hover (mirip Shopee)
                onClick={() => setActiveImage(img)}
              />
            ))}
          </div>
        </div>

        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-meta">
            <span className="rating-stars">⭐⭐⭐⭐⭐ 5.0</span>
            <span>|</span>
            <span>{product.brand}</span>
            <span>|</span>
            <span>Terjual 100+</span>
          </div>

          <div className="price-area">
            <span className="price-text">{formatRp(product.price)}</span>
          </div>

          <div className="variant-row">
            <span className="variant-label">Pilih Ukuran</span>
            <div className="size-grid">
              {sizeList.map((size) => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="variant-row">
            <span className="variant-label">Kuantitas</span>
            <div className="qty-selector">
                <button className="qty-btn" onClick={() => handleQtyChange(-1)}>-</button>
                <input type="text" className="qty-input" value={quantity} readOnly />
                <button className="qty-btn" onClick={() => handleQtyChange(1)}>+</button>
            </div>
            <span className="stock-info">Tersisa {product.stock} buah</span>
          </div>

          <div className="action-buttons">
            <button 
                className="btn-add-cart" 
                onClick={() => handleTransaction(false)}
                disabled={product.stock === 0}
            >
                🛒 Masukkan Keranjang
            </button>
            
            <button 
                className="btn-buy-now" 
                onClick={() => handleTransaction(true)}
                disabled={product.stock === 0}
            >
                Beli Sekarang
            </button>
          </div>
        </div>
      </div>

      <div className="detail-container" style={{marginTop: '20px', display: 'block'}}>
        
        {/* Info Penjual */}
        <div className="seller-info">
            <div className="seller-avatar" style={{backgroundImage: 'url(https://via.placeholder.com/50)'}}></div>
            <div>
                <h4 style={{margin:0, color:'var(--text-color)'}}>{product.seller_name || 'Urban Official'}</h4>
                <small style={{color:'var(--text-muted)'}}>Aktif 5 menit lalu</small>
            </div>
            <button className="btn-dark" style={{marginLeft:'auto', padding:'5px 15px', fontSize:'0.8rem'}}>Kunjungi Toko</button>
        </div>

        <div className="section-header">Spesifikasi Produk</div>
        <div style={{padding: '0 15px 20px', color: 'var(--text-muted)', fontSize:'0.9rem'}}>
            <p>Merek: {product.brand}</p>
            <p>Stok: {product.stock}</p>
            <p>Dikirim Dari: Jakarta Pusat</p>
        </div>

        <div className="section-header">Deskripsi Produk</div>
        <p style={{padding: '0 15px', whiteSpace: 'pre-line', lineHeight: '1.6', color: 'var(--text-color)'}}>
            {product.description}
        </p>
      </div>

    </div>
  );
}

export default ProductDetailPage;