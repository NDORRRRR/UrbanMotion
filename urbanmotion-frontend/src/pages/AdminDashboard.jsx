import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/admin/pending');
      setRequests(response.data);
    } catch (error) {
      alert('Gagal mengambil data admin. Pastikan login sebagai Admin!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleVerify = async (id, result) => {
    if (!window.confirm(`Yakin tandai sepatu ini sebagai ${result.toUpperCase()}?`)) return;

    try {
      await api.put(`/admin/verify/${id}`, { result });
      // Hapus item dari list setelah sukses
      setRequests(requests.filter(req => req.id !== id));
      alert('Status berhasil diupdate!');
    } catch (error) {
      alert('Gagal update status.');
    }
  };

  if (loading) return <p style={{textAlign:'center', marginTop:'2rem'}}>Loading Dashboard...</p>;

  return (
    <div className="admin-container">
      <h1 style={{ color: 'var(--main-red)' }}>Admin Dashboard</h1>
      <p>Permintaan Pending: {requests.length}</p>

      {requests.length === 0 ? (
        <div className="request-card">
          <p>Tidak ada permintaan legit check baru. Kerja bagus, Admin! 👍</p>
        </div>
      ) : (
        requests.map((req) => (
          <div key={req.id} className="request-card">
            <div className="card-header">
              <div>
                <h3 className="sneaker-title">{req.sneaker_name}</h3>
                <span className="user-info">Dikirim oleh: <b>{req.username}</b> ({req.email})</span>
              </div>
              <div>
                <span style={{background:'#fef3c7', padding:'4px 8px', borderRadius:'4px', fontSize:'0.8rem', color:'#b45309'}}>
                  Pending
                </span>
              </div>
            </div>

            <div className="card-images">
              {req.images.map((imgUrl, idx) => (
                <a key={idx} href={imgUrl} target="_blank" rel="noreferrer">
                  <img src={imgUrl} alt="Bukti" className="card-img" />
                </a>
              ))}
            </div>

            <div className="card-actions">
              <button 
                className="btn-legit"
                onClick={() => handleVerify(req.id, 'verified')}
              >
                ✅ VERIFIED (LEGIT)
              </button>
              <button 
                className="btn-fake"
                onClick={() => handleVerify(req.id, 'fake')}
              >
                ❌ FAKE (PALSU)
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminDashboard;