import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const BANNERS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070&auto=format&fit=crop',
    title: 'URBAN MOTION',
    subtitle: 'Platform Jual Beli & Legit Check Sneakers Terpercaya No. 1 di Indonesia.'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=2021&auto=format&fit=crop', // Foto Toko Sepatu
    title: 'AUTHENTIC GUARANTEED',
    subtitle: 'Setiap pasang sepatu diverifikasi oleh ahli. 100% Original atau uang kembali.'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=2070&auto=format&fit=crop', // Foto Sneakers Neon
    title: 'NEW ARRIVALS',
    subtitle: 'Dapatkan koleksi sneakers terbaru dan terpanas minggu ini.'
  }
];

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      // Pindah ke slide berikutnya, kalau habis balik ke 0
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, 3000);

    return () => clearInterval(slideInterval);
  }, []);

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* 3. Hero Section (Carousel Dinamis) */}
      <div 
        className="hero-section"
        style={{ 
          // Ganti gambar background sesuai slide aktif
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${BANNERS[currentSlide].image}')`
        }}
      >
        <div className="hero-content">
          {/* Teks berubah sesuai slide */}
          <h1>{BANNERS[currentSlide].title}</h1>
          <p>{BANNERS[currentSlide].subtitle}</p>
          <a href="#shop" className="hero-btn">Belanja Sekarang</a>
        </div>

        {/* 4. Indikator Titik (Dots) di Bawah */}
        <div className="hero-dots">
          {BANNERS.map((_, index) => (
            <span 
              key={index} 
              className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)} // Bisa diklik manual juga
            />
          ))}
        </div>
      </div>

      {/* 5. Trust Features */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Legit Check Pro</h3>
          <p>Verifikasi keaslian oleh ahli profesional.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💎</div>
          <h3>100% Authentic</h3>
          <p>Garansi uang kembali jika barang fake.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🚀</div>
          <h3>Fast Shipping</h3>
          <p>Pengiriman cepat ke seluruh Indonesia.</p>
        </div>
      </div>

      {/* 6. Produk Grid */}
      <div id="shop">
        <h2 className="section-title">New Arrivals 🔥</h2>
        
        {loading ? (
          <div style={{textAlign: 'center', padding: '4rem'}}>
            <p>Sedang memuat produk...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px'}}>
            <p style={{fontSize: '1.2rem', color: '#666'}}>Belum ada produk yang dijual saat ini.</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
            gap: '25px' 
          }}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;