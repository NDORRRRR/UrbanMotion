import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Untuk pindah halaman
import { useAuth } from '../context/AuthContext'; // "Memori Global"
import api from '../services/api'; // "Kurir"

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isRegisterMode, setIsRegisterMode] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault(); // Mencegah refresh
        setLoading(true); // Tampilkan loading
        setError(''); // Bersihkan error lama

    // Siapkan data untuk dikirim
    let userData;
    if (isRegisterMode) {
        userData = { username, email, password };
    } else {
        userData = { email, password };
    }

    try {
      if (isRegisterMode) {
        // --- MODE REGISTER ---
        // Kirim data ke "pintu" register
        await api.post(isRegisterMode ? '/auth/register' : '/auth/login', userData);
        
        // Kalo sukses, kita kasih tau
        alert('Registrasi berhasil! Silakan login.');
        
        // Balikin ke mode login & bersihkan form
        setIsRegisterMode(false);
        setEmail('');
        setPassword('');

      } else {
        // --- MODE LOGIN ---
        // Kirim data ke "pintu" login
        const response = await api.post('/auth/login', userData);
        
        // Backend akan kirim balasan (data user & "tiket" token)
        const { user, token } = response.data;
        
        // Panggil fungsi 'login' dari Context
        // Ini akan simpan token ke memori global & localStorage
        login(user, token);
        
        // Pindah user ke halaman Home
        navigate('/');
      }

    } catch (err) {
      // 4. JIKA GAGAL (Entah itu dari backend atau jaringan)
      console.error("Error submit:", err);
      // Tampilkan pesan error yang dikirim backend
      setError(err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false); // Matikan loading
    }
  };

  return (
    <div className='form-container'>
      <h2>{isRegisterMode ? 'Register Akun Baru' : 'Login'}</h2>

      <form onSubmit={handleSubmit}>
        {isRegisterMode && (
        <div className='form-group'>
            <label>Username</label> <br />
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required style={{ width: '95%', padding: '8px' }}
            />
        </div>
        )}

        <div className='form-group'>
          <label>Email</label> <br />
          <input 
            type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            required style={{ width: '95%', padding: '8px' }}
          />
        </div>
        <div className='form-group'>
          <label>Password</label> <br />
          <input 
            type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            required style={{ width: '95%', padding: '8px' }}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button 
          type="submit" 
          disabled={loading} // Bikin tombol mati saat loading
          className="btn-dark"
          style={{ width: '100%', padding: '10px', background: 'black', color: 'white', border: 'none' }}
        >
          {loading ? 'Memproses...' : (isRegisterMode ? 'Register' : 'Login')}
        </button>
      </form>

      <p className="form-switch">
        {isRegisterMode ? 'Sudah punya akun?' : 'Belum punya akun?'}
        <span 
          onClick={() => setIsRegisterMode(!isRegisterMode)}
          style={{ color: 'blue', cursor: 'pointer', marginLeft: '5px' }}
        >
          {isRegisterMode ? 'Login di sini' : 'Register di sini'}
        </span>
      </p>
    </div>
  );
}

export default LoginPage;