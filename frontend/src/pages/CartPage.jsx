import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CartPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatRp = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  // Ambil Data Keranjang
  const fetchCart = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.get('/cart');
      setCartItems(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      alert(error.response?.data?.message || 'Gagal mengambil data keranjang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wajib Login untuk lihat Keranjang
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [token, navigate]);

  // Logic Hapus Item
  const handleRemoveItem = async (productId, size) => {
    if (!window.confirm('Yakin ingin menghapus item ini dari keranjang?')) return;
    try {
      // Panggil API DELETE
      await api.delete(`/cart/${productId}?size=${size}`);
      setCartItems(cartItems.filter(item => !(item.product_id === productId && item.size === size)));
    } catch (error) {
      alert('Gagal menghapus item.');
    }
  };

  // Logic Ubah Kuantitas
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return handleRemoveItem(productId);
    
    // Optimistic Update: Langsung ubah di frontend dulu
    setCartItems(
      cartItems.map(item => 
        item.product_id === productId ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      // Panggil API POST (Update)
      await api.post('/cart', { productId, quantity: newQuantity });
    } catch (error) {
      alert('Gagal update kuantitas.');
      // Kalau gagal, kita panggil fetchCart() untuk balik ke data asli
      fetchCart(); 
    }
  };


  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  if (loading) return <p style={{textAlign:'center', marginTop:'3rem'}}>Memuat Keranjang...</p>;


  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ color: 'var(--text-color)', marginBottom: '1.5rem' }}>Keranjang Belanja Anda</h1>

      {cartItems.length === 0 ? (
        <p style={{color: 'var(--text-muted)'}}>Keranjang masih kosong. Yuk, cari sepatu!</p>
      ) : (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          
          {/* KOLOM KIRI: LIST BARANG */}
          <div style={{ flex: 3, minWidth: '300px' }}>
            {cartItems.map(item => (
              <div key={item.product_id} style={{ 
                  display: 'flex', 
                  border: '1px solid var(--border-color)', // FIX
                  padding: '1rem', marginBottom: '10px', 
                  backgroundColor: 'var(--card-bg)', // FIX
                  borderRadius: '6px', alignItems: 'center',
                  color: 'var(--text-color)' // FIX
                }}>
                
                <img src={item.image_url} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', marginRight: '1rem' }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-color)' }}>{item.name}</h3>
                  <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ukuran: <strong>{item.size}</strong></p>
                  <p style={{ margin: '5px 0', fontWeight: 'bold', color: 'var(--main-red)' }}>{formatRp(item.price)}</p>
                </div>

                {/* Kuantitas */}
                <div style={{ width: '120px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)} className="btn-dark" style={{ padding: '5px' }}>-</button>
                  <span style={{ margin: '0 10px', color: 'var(--text-color)' }}>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)} className="btn-dark" style={{ padding: '5px' }} disabled={item.quantity >= item.stock}>+</button>
                </div>

                {/* Subtotal Item */}
                <div style={{ width: '120px', textAlign: 'right', fontWeight: 'bold', color: 'var(--text-color)' }}>
                  {formatRp(item.price * item.quantity)}
                </div>

                <button onClick={() => handleRemoveItem(item.product_id)} style={{ marginLeft: '1rem', background: 'none', color: 'var(--main-red)', fontSize:'1.2rem' }}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* KOLOM KANAN: RINGKASAN */}
          <div style={{ flex: 1, border: '1px solid var(--main-grey)', padding: '1.5rem', backgroundColor: 'white', borderRadius: '6px', height: 'fit-content' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Ringkasan Pesanan</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Total Barang ({cartItems.length})</span>
              <span>{formatRp(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 'bold', fontSize: '1.2rem', paddingTop: '10px', borderTop: '1px solid #eee' }}>
              <span>Total Pembayaran</span>
              <span style={{ color: 'var(--main-red)' }}>{formatRp(subtotal)}</span>
            </div>

            {/* Tombol Checkout (Next Step) */}
            <button 
                className="btn-primary" 
                style={{ width: '100%', marginTop: '1rem' }} 
                onClick={() => navigate('/checkout')}
                disabled={cartItems.length === 0}
            >
              Lanjut ke Pembayaran
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;