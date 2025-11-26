import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ProductCard.css';

function ProductCard({ product }) {
  // Logic Hover Slide
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Logic Cart
  const { token } = useAuth();
  const navigate = useNavigate();

  const images = product.images || [];

  // Logika SLIDE OTOMATIS
  useEffect(() => {
    let interval;
    if (isHovered && images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 1000);
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  // Format Rupiah
  const formatRp = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Logic Tambah ke Keranjang
  const handleAddToCart = async () => {
    if (!token) {
      alert('Login dulu, Bos, untuk menambahkan barang ke keranjang!');
      navigate('/login');
      return;
    }

    try {
      await api.post('/cart', {
        productId: product.id,
        quantity: 1,
      });
      alert(`"${product.name}" berhasil ditambahkan ke keranjang!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambahkan ke keranjang.');
    }
  };


  return (
    <div 
      className="product-card"
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)} 
    >
      <div className="product-img-container">
        {/* onClick={() => navigate(`/product/${product.id}`)}
        style={{cursor: 'pointer'}} */}
        {images.length > 0 ? (
          <img 
            src={images[currentImageIndex]} 
            alt={product.name} 
            className="product-img"
            style={{ transition: 'opacity 0.3s ease-in-out' }}
          />
        ) : (
          <div style={{color:'#ccc'}}>No Image</div>
        )}
        
        {isHovered && images.length > 1 && (
          <div style={{ position: 'absolute', bottom: '10px', display: 'flex', gap: '4px' }}>
            {images.map((_, idx) => (
              <div 
                key={idx}
                style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  backgroundColor: idx === currentImageIndex ? 'var(--main-red)' : '#ccc'
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="product-info">
        <div className="product-brand">{product.brand}</div>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">{formatRp(product.price)}</div>
        <small className="product-seller">Penjual: {product.seller_name}</small>
        
        {/* ⬇️ TOMBOL ADD TO CART ⬇️ */}
        <button className="btn-add-to-cart" onClick={handleAddToCart} disabled={product.stock === 0}>
          {product.stock > 0 ? 'Tambahkan ke Keranjang' : 'Stok Habis'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;