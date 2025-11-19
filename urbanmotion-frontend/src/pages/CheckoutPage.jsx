// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Midtrans wajib ada di browser
const loadMidtransScript = () => {
    return new Promise((resolve) => {
        if (window.snap) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'; // Sandbox URL
        script.setAttribute('data-client-key', 'Mid-client-WAQ7tAcoBl-k3nZU');
        script.onload = resolve;
        document.body.appendChild(script);
    });
};

function CheckoutPage() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shippingAddress, setShippingAddress] = useState('');

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalAmount = subtotal; // Belum termasuk ongkir

    // 1. Ambil Data Keranjang saat halaman dibuka
    useEffect(() => {
        const fetchCartAndScripts = async () => {
            try {
                const response = await api.get('/cart');
                if (response.data.length === 0) {
                    alert("Keranjang kosong, kembali ke toko!");
                    navigate('/');
                    return;
                }
                setCartItems(response.data);
                
                // Load Midtrans Script di sini
                await loadMidtransScript();

            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Gagal memuat data checkout.");
            } finally {
                setLoading(false);
            }
        };
        fetchCartAndScripts();
    }, [navigate]);

    // Format Rupiah
    const formatRp = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    // 2. Logic Final Checkout (Panggil API Backend)
    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!shippingAddress) {
            alert('Alamat pengiriman wajib diisi!');
            return;
        }

        const itemsPayload = cartItems.map(item => ({
            product_id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            seller_id: 1, // ⚠️ ASUMSI: Seller ID 1 adalah ID Admin/Penjual Utama. Bos harus sesuaikan.
        }));
        
        try {
            // Panggil API Backend (yang akan memanggil Midtrans)
            const response = await api.post('/checkout', { 
                shipping_address: shippingAddress,
                total_amount: finalAmount,
                payment_method: 'midtrans_snap',
                items: itemsPayload,
            }); 
            const { snap_token, orderId } = response.data;

            // 3. Buka Pop-up Midtrans SNAP
            window.snap.pay(snap_token, {
                onSuccess: function(result) {
                    alert(`Pembayaran Sukses! Order ID: ${orderId}`);
                    // ⚠️ Lanjut: Update status order di DB (BUTUH API BARU)
                    navigate('/history');
                },
                onPending: function(result) {
                    alert(`Pembayaran Pending! Silakan selesaikan pembayaran.`);
                    navigate('/history');
                },
                onError: function(result) {
                    alert("Pembayaran Gagal.");
                },
                onClose: function() {
                    alert('Anda menutup pop-up pembayaran.');
                }
            });

        } catch (error) {
            alert(error.response?.data?.message || 'Gagal memproses Checkout.');
        }
    };


    if (loading) return <p style={{textAlign:'center', marginTop:'3rem'}}>Memuat Checkout...</p>;

    return (
        <div className="form-container" style={{maxWidth:'1000px', padding:'2rem', marginTop:'2rem'}}>
            <h1 style={{color:'var(--main-dark)', borderBottom:'1px solid #ddd', paddingBottom:'10px', marginBottom:'2rem'}}>Ringkasan Checkout</h1>
            
            <form onSubmit={handleCheckout} style={{display:'flex', gap:'30px'}}>
                
                {/* Kolom Kiri: Alamat & Item */}
                <div style={{flex: 2}}>
                    
                    <h3>1. Alamat Pengiriman</h3>
                    <div className="form-group">
                        <textarea 
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            placeholder="Masukkan alamat lengkap, termasuk nama penerima dan nomor HP."
                            rows="4" 
                            required
                        ></textarea>
                    </div>

                    <h3>2. Detail Pesanan</h3>
                    {cartItems.map(item => (
                        <div key={item.product_id} style={{display:'flex', alignItems:'center', borderBottom:'1px solid #eee', padding:'10px 0'}}>
                            <img src={item.image_url} alt={item.name} style={{width:'50px', height:'50px', objectFit:'cover', marginRight:'15px'}}/>
                            <div style={{flex: 1}}>
                                <h4 style={{margin:0, fontSize:'1rem'}}>{item.name}</h4>
                                <span style={{fontSize:'0.9rem'}}>Qty: {item.quantity}</span>
                            </div>
                            <span style={{fontWeight:'bold'}}>{formatRp(item.price * item.quantity)}</span>
                        </div>
                    ))}
                </div>

                {/* Kolom Kanan: Pembayaran */}
                <div style={{flex: 1, backgroundColor:'#f9fafb', padding:'1.5rem', borderRadius:'8px', height: 'fit-content'}}>
                    <h3>3. Ringkasan Pembayaran</h3>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                        <span>Subtotal ({cartItems.length} barang)</span>
                        <span>{formatRp(subtotal)}</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px', paddingBottom:'15px', borderBottom:'1px solid #ddd'}}>
                        <span>Biaya Pengiriman</span>
                        <span>Gratis</span> {/* Asumsi sementara */}
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'1.4rem'}}>
                        <span>TOTAL</span>
                        <span style={{color:'var(--main-red)'}}>{formatRp(finalAmount)}</span>
                    </div>

                    <button type="submit" className="btn-primary" style={{width:'100%', marginTop:'2rem', padding:'15px'}}>
                        BAYAR SEKARANG
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CheckoutPage;