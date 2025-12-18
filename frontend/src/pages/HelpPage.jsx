import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaEnvelope, FaBuilding } from 'react-icons/fa';

const HelpPage = () => {
    const location = useLocation();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(null);

    useEffect(() => {
        const path = location.pathname;

        switch (path) {
            case '/faq':
                setTitle('Frequently Asked Questions (FAQ)');
                setContent(
                    <div className="help-content">
                        <h3>1. Apakah produk Urban Motion Authentic?</h3>
                        <p>Ya, 100% Authentic. Kami melakukan proses Legit Check yang ketat untuk setiap sepatu yang masuk.</p>
                        <h3>2. Berapa lama pengiriman?</h3>
                        <p>Untuk Jabodetabek 1-3 hari kerja. Luar kota 3-5 hari kerja.</p>
                        <h3>3. Apakah bisa retur?</h3>
                        <p>Bisa, maksimal 2x24 jam setelah barang diterima dengan video unboxing tanpa cut.</p>
                    </div>
                );
                break;
            case '/shipping':
                setTitle('Kebijakan Pengiriman');
                setContent(
                    <div className="help-content">
                        <p>Kami bekerja sama dengan JNE, J&T, dan SiCepat untuk pengiriman ke seluruh Indonesia.</p>
                        <ul>
                            <li>Pengiriman dilakukan setiap Senin - Sabtu.</li>
                            <li>Order sebelum jam 15.00 dikirim hari yang sama.</li>
                            <li>Nomor resi otomatis diupdate H+1 pengiriman.</li>
                        </ul>
                    </div>
                );
                break;
            case '/returns':
                setTitle('Kebijakan Pengembalian');
                setContent(
                    <div className="help-content">
                        <p>Kami menjamin kepuasan pelanggan. Jika barang tidak sesuai deskripsi atau terbukti palsu, kami kembalikan uang Anda 100%.</p>
                        <p>Syarat Retur:</p>
                        <ul>
                            <li>Video Unboxing Wajib.</li>
                            <li>Tag masih terpasang.</li>
                            <li>Kondisi sepatu belum dipakai outdoor.</li>
                        </ul>
                    </div>
                );
                break;
            case '/contact':
                setTitle('Hubungi Kami');
                setContent(
                    <div className="help-content">
                        <p>Butuh bantuan lebih lanjut? Hubungi tim support kami:</p>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaWhatsapp color="#25D366" /> WhatsApp: 0812-3456-7890</p>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaEnvelope color="#1E88E5" /> Email: support@urbanmotion.com</p>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaBuilding color="#555" /> Alamat: Jl. Sudirman No. 1, Jakarta Pusat.</p>
                    </div>
                );
                break;
            default:
                setTitle('Halaman Tidak Ditemukan');
                setContent(<p>Maaf, halaman yang Anda cari tidak tersedia.</p>);
        }
    }, [location.pathname]);

    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 style={{ marginBottom: '2rem', color: 'var(--text-color)', borderBottom: '2px solid var(--main-red)', display: 'inline-block' }}>{title}</h1>
                <div style={{ lineHeight: '1.8', color: 'var(--text-muted)' }}>
                    {content}
                </div>
            </motion.div>
        </div>
    );
};

export default HelpPage;
