import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeImage, setActiveImage] = useState('');
  
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeList, setSizeList] = useState([]);

  const formatRp = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        const data = res.data;
        setProduct(data);

        if(data.images && data.images.length > 0) setActiveImage(data.images[0]);
        else setActiveImage(data.image_url);
        
        // Parse Size
        if (data.sizes) {
          const parsedSizes = data.sizes.split(',').map(s => s.trim()).filter(s => s);
          setSizeList(parsedSizes.length > 0 ? parsedSizes : ['38', '39', '40', '41', '42', '43', '44']);
        } else {
          setSizeList(['38', '39', '40', '41', '42', '43', '44']);
        }

        // Rekomendasi
        const relatedRes = await api.get('/products', { params: { brand: data.brand } });
        setRelatedProducts(relatedRes.data.filter(p => p.id !== parseInt(id)).slice(0, 4));

      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat produk.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleQtyChange = (val) => {
    const stockAvailable = parseInt(product?.stock) || 0;
    let newQty = quantity + val;

    if (newQty < 1) {
        newQty = 1; 
        toast('Minimal beli 1 pasang ya Bos', { icon: '😅' });
    }

    if (newQty > stockAvailable) {
        newQty = stockAvailable;
        toast.error(`Waduh, stok cuma sisa ${stockAvailable} pasang!`);
    }

    setQuantity(newQty);
  };

  const handleTransaction = async (isDirectBuy) => {
    if (!token) {
      toast.error('Login dulu, Bos!');
      navigate('/login');
      return;
    }
    
    if (!selectedSize) {
      toast.error('⚠️ Pilih ukuran sepatu dulu!');
      return;
    }

    const toastId = toast.loading('Sedang memproses...');

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
        toast.success(`Size ${selectedSize} (x${quantity}) masuk keranjang!`, { id: toastId });
      }
    } catch (error) {
      toast.error('Gagal memproses transaksi.', { id: toastId });
    }
  };

  if (loading) return <div className="detail-loading">Loading...</div>;
  if (!product) return <div className="detail-loading">Produk tidak ditemukan.</div>;

  return (
    <div className="detail-page-wrapper">
      <Toaster position="top-center" />
      
      <div className="detail-container">
        
        <div className="gallery-container">
          <div className="main-image-wrapper">
             <img src={activeImage} alt={product.name} className="main-image" />
          </div>
          <div className="thumb-grid">
            {product.images && product.images.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`Thumbnail ${idx + 1}`}
                className={`thumb-img ${activeImage === img ? 'active' : ''}`}
                onMouseEnter={() => setActiveImage(img)}
                onClick={() => setActiveImage(img)}
              />
            ))}
          </div>
        </div>

        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>
          <div className="product-meta" style={{color: 'var(--text-muted)', marginBottom: '10px'}}>
            <span>{product.brand}</span>
            <span className="separator" style={{margin: '0 8px'}}>|</span>
            <span>Stok: <strong>{product.stock}</strong></span>
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
            <span className="variant-label">Jumlah</span>
            <div className="qty-selector">
                <button 
                    className="qty-btn" 
                    type="button"
                    onClick={() => handleQtyChange(-1)}
                >-</button>
                
                <input 
                    type="text" 
                    className="qty-input" 
                    value={quantity} 
                    readOnly 
                />
                
                <button 
                    className="qty-btn" 
                    type="button" 
                    onClick={() => handleQtyChange(1)}
                >+</button>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-add-cart" onClick={() => handleTransaction(false)} disabled={product.stock === 0}>
                + Keranjang
            </button>
            <button className="btn-buy-now" onClick={() => handleTransaction(true)} disabled={product.stock === 0}>
                Beli Sekarang
            </button>
          </div>
        </div>
      </div>

      <div className="detail-container" style={{marginTop:'20px', display:'block'}}>
         <h3 className="section-header">Deskripsi</h3>
         <p className="product-desc-text">{product.description || 'Tidak ada deskripsi.'}</p>
      </div>
      
      {relatedProducts.length > 0 && (
          <div className="detail-container" style={{marginTop:'20px', display:'block'}}>
             <h3 className="section-header">Produk Serupa</h3>
             <div className="related-grid">
                 {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
             </div>
          </div>
      )}
    </div>
  );
}

export default ProductDetailPage;