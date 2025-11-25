import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './HistoryPage.css';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/legit-check/history');
        setHistory(response.data);
      } catch (error) {
        console.error("Gagal ambil history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getStatusBadge = (item) => {
    if (item.status === 'pending') {
      return <span className="status-badge status-pending">Menunggu Review</span>;
    }
    if (item.result === 'verified') {
      return <span className="status-badge status-legit">✅ LEGIT (ASLI)</span>;
    }
    if (item.result === 'fake') {
      return <span className="status-badge status-fake">❌ FAKE (PALSU)</span>;
    }
    return <span>-</span>;
  };

  return (
    <div className="history-container">
      <h2 style={{ color: 'var(--main-red)', marginBottom: '1.5rem' }}>Riwayat Legit Check Saya</h2>

      {loading ? (
        <p>Memuat data...</p>
      ) : history.length === 0 ? (
        <p>Belum ada riwayat. Yuk submit sepatu pertamamu!</p>
      ) : (
        history.map((item) => (
          <div key={item.id} className="history-card">
            <div className="card-left">
              {item.images.length > 0 && (
                <img src={item.images[0]} alt="Sepatu" className="history-img" />
              )}
              <div className="history-info">
                <h3>{item.sneaker_name}</h3>
                <span className="history-date">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="card-right">
              {getStatusBadge(item)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default HistoryPage;