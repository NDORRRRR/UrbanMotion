// src/pages/ProductDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast'; // ✅ Pakai Toast
import ProductCard from '../components/ProductCard'; // ✅ Import Card
import './ProductDetail.css';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]); // ✅ State Rekomendasi
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeList, setSizeList] = useState([]);

  const formatRp = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  // 1. Fetch Detail & Rekomendasi
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            // Ambil Detail
            const res = await api.get(`/products/${id}`);
            setProduct(res.data);
            
            if(res.data.images && res.data.images.length > 0) setActiveImage(res.data.images[0]);
            else setActiveImage(res.data.image_url);
            
            if (res.data.sizes) setSizeList(res.data.sizes.split(',').map(s => s.trim()));

            // ✅ Ambil Produk Rekomendasi (Brand sama, kecuali produk ini)
            const relatedRes = await api.get('/products', { params: { brand: res.data.brand } });
            // Filter biar produk yg sedang dibuka ga muncul di rekomendasi & ambil 4 aja
            const filtered = relatedRes.data
                .filter(p => p.id !== parseInt(id))
                .slice(0, 4);
            setRelatedProducts(filtered);

        } catch (err) {
            console.error(err);
            toast.error("Gagal memuat produk");
        } finally {
            setLoading(false);
        }
    };
    fetchData();
    window.scrollTo(0, 0); // Scroll ke atas pas ganti halaman
  }, [id]);

  const handleTransaction = async (isDirectBuy) => {
    if (!token) {
      toast.error('Silakan Login dahulu!');
      navigate('/login');
      return;
    }
    
    if (!selectedSize) {
      toast.error('Pilih ukuran sepatu dulu!'); // ✅ Toast Error
      return;
    }

    const toastId = toast.loading('Memproses...'); // Loading state

    try {
      await api.post('/cart', { 
        productId: product.id, 
        quantity: quantity,
        size: selectedSize 
      });

      if (isDirectBuy) {
        toast.dismiss(toastId);
        navigate('/cart'); 
      } else {
        toast.success('Berhasil masuk keranjang!', { id: toastId }); // ✅ Toast Sukses
      }
    } catch (error) {
      toast.error('Gagal menambahkan produk.', { id: toastId });
    }
  };

  const handleQtyChange = (val) => {
    const newQty = quantity + val;
    if (newQty >= 1 && newQty <= (product.stock || 1)) setQuantity(newQty);
  };

  if (loading) return <div className="detail-page-wrapper" style={{display:'flex',justifyContent:'center',alignItems:'center',height:'80vh'}}>Loading...</div>;
  if (!product) return <div className="detail-page-wrapper">Produk tidak ditemukan</div>;

  return (
    <div className="detail-page-wrapper">
      <Toaster /> {/* Wadah Notifikasi */}
      
      {/* Bagian Detail (Kode Lama Bos Tetap Aman Disini) */}
      <div className="detail-container">
         {/* ... (COPY ISI DETAIL CONTAINER DARI KODE SEBELUMNYA DI SINI) ... */}
         {/* Bagian Kiri (Gambar) & Kanan (Info) biarkan sama seperti sebelumnya */}
         <div className="gallery-container">
            <img src={activeImage} alt={product.name} className="main-image" />
            <div className="thumb-grid">
                {product.images && product.images.map((img, idx) => (
                <img key={idx} src={img} className={`thumb-img ${activeImage === img ? 'active' : ''}`} onMouseEnter={() => setActiveImage(img)} onClick={() => setActiveImage(img)} />
                ))}
            </div>
         </div>

         <div className="product-info-section">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-meta">
                <span className="rating-stars">⭐⭐⭐⭐⭐ 5.0</span>
                <span>{product.brand}</span>
            </div>
            <div className="price-area">
                <span className="price-text">{formatRp(product.price)}</span>
            </div>

            <div className="variant-row">
                <span className="variant-label">Pilih Ukuran</span>
                <div className="size-grid">
                {sizeList.map((size) => (
                    <button key={size} className={`size-btn ${selectedSize === size ? 'active' : ''}`} onClick={() => setSelectedSize(size)}>{size}</button>
                ))}
                </div>
            </div>

            <div className="variant-row">
                <span className="variant-label">Jumlah</span>
                <div className="qty-selector">
                    <button className="qty-btn" onClick={() => handleQtyChange(-1)}>-</button>
                    <input type="text" className="qty-input" value={quantity} readOnly />
                    <button className="qty-btn" onClick={() => handleQtyChange(1)}>+</button>
                </div>
                <span className="stock-info">Stok: {product.stock}</span>
            </div>

            <div className="action-buttons">
                <button className="btn-add-cart" onClick={() => handleTransaction(false)} disabled={product.stock === 0}>Masukkan Keranjang</button>
                <button className="btn-buy-now" onClick={() => handleTransaction(true)} disabled={product.stock === 0}>Beli Sekarang</button>
            </div>
         </div>
      </div>

      {/* ✅ 4. FITUR BARU: PRODUK REKOMENDASI */}
      <div className="detail-container" style={{marginTop:'40px', display:'block'}}>
         <h3 className="section-header" style={{background:'transparent', paddingLeft:0}}>Mungkin Kamu Suka</h3>
         {relatedProducts.length > 0 ? (
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'20px'}}>
                {relatedProducts.map(p => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
         ) : (
             <p style={{color:'var(--text-muted)'}}>Tidak ada produk serupa.</p>
         )}
      </div>

      {/* Deskripsi (Pindah ke bawah rekomendasi atau biarkan di atas terserah) */}
      <div className="detail-container" style={{marginTop: '20px', display: 'block'}}>
         <div className="section-header">Deskripsi Produk</div>
         <p style={{padding: '0 15px', whiteSpace: 'pre-line', lineHeight: '1.6', color: 'var(--text-color)'}}>{product.description}</p>
      </div>

    </div>
  );
}

export default ProductDetailPage;