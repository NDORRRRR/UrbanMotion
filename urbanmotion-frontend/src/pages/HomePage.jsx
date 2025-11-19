import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data produk saat halaman dibuka
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error("Gagal ambil produk:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Banner Sederhana */}
      <div style={{ 
        textAlign: 'center', marginBottom: '3rem', 
        padding: '3rem 1rem', background: 'var(--main-dark)', color: 'white', borderRadius: '8px'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>URBAN MOTION MARKET</h1>
        <p>Temukan Sneakers Original & Rare Item di Sini</p>
      </div>

      {/* Grid Produk */}
      <h2 style={{ color: 'var(--main-red)', marginBottom: '1.5rem' }}>New Arrivals</h2>
      
      {loading ? (
        <p>Loading produk...</p>
      ) : products.length === 0 ? (
        <p>Belum ada produk yang dijual. Jadilah penjual pertama!</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '20px' 
        }}>
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;