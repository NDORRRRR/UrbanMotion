// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion'; // Import animasi
import { Toaster } from 'react-hot-toast'; // Import notifikasi cantik
import './HomePage.css';

// Banner Tetap
const BANNERS = [
  { id: 1, image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070&auto=format&fit=crop', title: 'URBAN MOTION', subtitle: 'Platform Sneakers No. 1 Indonesia.' },
  { id: 2, image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=2070&auto=format&fit=crop', title: 'NEW DROPS', subtitle: 'Koleksi terbaru minggu ini.' }
];

// List Brand Populer
const BRANDS = ["All", "Nike", "Adidas", "Jordan", "New Balance", "Vans", "Puma", "Converse"];

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // State Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  // Carousel
  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % BANNERS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/products', {
          params: { search: searchTerm, brand: selectedBrand, sort: sortOrder }
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Gagal load produk:", error);
        toast.error("Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    };
    const timeoutId = setTimeout(fetchProducts, 400); 
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedBrand, sortOrder]);

  // Fetch Data
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/products', {
          params: { search: searchTerm, brand: selectedBrand, sort: sortOrder }
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Gagal load produk:", error);
      } finally {
        setLoading(false);
      }
    };
    const timeoutId = setTimeout(fetchProducts, 400); 
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedBrand, sortOrder]);

  return (
    <div className="home-wrapper">
      <Toaster position="top-center" />
      
      {/* 1. HERO SECTION DINAMIS */}
      <div className="hero-section" style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url('${BANNERS[currentSlide].image}')` }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          key={currentSlide} // Reset animasi tiap slide ganti
          className="hero-content"
        >
          <h1>{BANNERS[currentSlide].title}</h1>
          <p>{BANNERS[currentSlide].subtitle}</p>
        </motion.div>
      </div>

      <div className="main-container">
        
        {/* 2. FILTER BAR MODERN (STICKY) */}
        <div className="sticky-filter-bar">
            {/* Search */}
            <div className="search-pill">
                <input 
                    type="text" 
                    placeholder="Cari sneakers impian..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="icon">🔍</span>
            </div>

            {/* Brand Tags (Horizontal Scroll) */}
            <div className="brand-scroll">
                {BRANDS.map(brand => (
                    <button 
                        key={brand}
                        className={`brand-pill ${selectedBrand === brand ? 'active' : ''}`}
                        onClick={() => setSelectedBrand(brand)}
                    >
                        {brand}
                    </button>
                ))}
            </div>
            
            {/* Sort (Pojok Kanan) */}
            <select className="sort-pill" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="newest">Terbaru</option>
                <option value="cheap">Termurah</option>
                <option value="expensive">Termahal</option>
            </select>
        </div>

        {/* 3. PRODUCT GRID DENGAN ANIMASI */}
        <h2 className="section-title">Katalog Pilihan</h2>
        
        {loading ? (
            <div className="loading-skeleton">
                {[1,2,3,4].map(n => <div key={n} className="skeleton-card"></div>)}
            </div>
        ) : products.length === 0 ? (
            <div className="empty-state">
                <img src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png" alt="Empty" width="100"/>
                <p>Produk tidak ditemukan.</p>
            </div>
        ) : (
            <motion.div 
                layout 
                className="product-grid"
            >
                {products.map((product) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        key={product.id}
                    >
                        <ProductCard product={product} />
                    </motion.div>
                ))}
            </motion.div>
        )}
      </div>
    </div>
  );
}

export default HomePage;