import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const BANNERS = [
  { id: 1, image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070&auto=format&fit=crop', title: 'URBAN MOTION', subtitle: 'Platform Jual Beli & Legit Check Sneakers Terpercaya.' },
  { id: 2, image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=2021&auto=format&fit=crop', title: 'AUTHENTIC GUARANTEED', subtitle: 'Setiap pasang sepatu diverifikasi oleh ahli.' },
  { id: 3, image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=2070&auto=format&fit=crop', title: 'NEW ARRIVALS', subtitle: 'Dapatkan koleksi sneakers terbaru minggu ini.' }
];

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  // Carousel Effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, 3000);
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/products', {
          params: {
            search: searchTerm,
            brand: selectedBrand,
            sort: sortOrder
          }
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Gagal ambil produk:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedBrand, sortOrder]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      <div 
        className="hero-section"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${BANNERS[currentSlide].image}')` }}
      >
        <div className="hero-content">
          <h1>{BANNERS[currentSlide].title}</h1>
          <p>{BANNERS[currentSlide].subtitle}</p>
          <a href="#shop" className="hero-btn">Belanja Sekarang</a>
        </div>
        <div className="hero-dots">
          {BANNERS.map((_, index) => (
            <span key={index} className={`hero-dot ${index === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(index)} />
          ))}
        </div>
      </div>

      <div id="shop" className="filter-container">
        
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Cari Jordan, Yeezy, dll..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
            <option value="All">Semua Brand</option>
            <option value="Nike">Nike</option>
            <option value="Adidas">Adidas</option>
            <option value="Jordan">Jordan</option>
            <option value="Puma">Puma</option>
            <option value="New Balance">New Balance</option>
            <option value="Vans">Vans</option>
          </select>

          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="newest">Terbaru</option>
            <option value="cheap">Termurah</option>
            <option value="expensive">Termahal</option>
          </select>
        </div>
      </div>

      <h2 className="section-title">
        {searchTerm ? `Hasil pencarian: "${searchTerm}"` : 'Katalog Sepatu 🔥'}
      </h2>
      
      {loading ? (
        <p style={{textAlign:'center', marginTop:'3rem'}}>Mencari sepatu...</p>
      ) : products.length === 0 ? (
        <div style={{textAlign: 'center', padding: '4rem', background: 'var(--card-bg)', borderRadius: '12px', border:'1px solid var(--border-color)'}}>
          <p style={{fontSize: '1.2rem', color: 'var(--text-muted)'}}>Tidak ada produk yang cocok dengan pencarianmu.</p>
          <button className="btn-dark" onClick={() => {setSearchTerm(''); setSelectedBrand('All')}}>Reset Filter</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' }}>
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;