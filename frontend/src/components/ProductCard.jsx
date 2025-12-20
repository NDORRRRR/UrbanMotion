import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ product }) {
  const navigate = useNavigate();

  // Format Rupiah
  const formatRp = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Fungsi pindah ke detail
  const goToDetail = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-card" onClick={goToDetail}>
      <div className="product-img-container">
        <img
          src={product.image_url || 'https://via.placeholder.com/300'}
          alt={product.name}
          className="product-img"
          loading="lazy"
          onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=No+Image'}
        />
        {/* Badge Stok Habis (Opsional) */}
        {product.stock === 0 && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(0,0,0,0.7)', color: 'white',
            padding: '5px 10px', fontSize: '0.8rem', borderRadius: '4px'
          }}>
            Habis
          </div>
        )}
      </div>

      {/* Info Produk */}
      <div className="product-info">
        <div className="product-brand">{product.brand}</div>
        <h3 className="product-name" title={product.name}>{product.name}</h3>
        <div className="product-price">{formatRp(product.price)}</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <span className="product-seller">
            🏪 {product.seller_name || 'Seller'}
          </span>
        </div>

        {/* Tombol sembunyi yang muncul saat hover (Hanya visual, fungsinya sama ke detail) */}
        <button className="btn-add-to-cart">
          Lihat Detail
        </button>
      </div>
    </div>
  );
}

export default ProductCard;