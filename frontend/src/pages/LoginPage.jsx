import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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
    event.preventDefault();
    setLoading(true);
    setError('');

    let userData;
    if (isRegisterMode) {
      userData = { username, email, password };
    } else {
      userData = { email, password };
    }

    try {
      const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
      const response = await api.post(endpoint, userData);

      if (isRegisterMode) {
        alert('Registrasi berhasil! Silakan login.');
        setIsRegisterMode(false);
        setEmail('');
        setPassword('');
        setUsername('');
      } else {
        const { user, token } = response.data;
        login(user, token);
        navigate('/');
      }

    } catch (err) {
      console.error("Error submit:", err);
      setError(err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>{isRegisterMode ? 'Register Akun Baru' : 'Login'}</h2>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>

        {/* Input Username (Hanya saat Register) */}
        {isRegisterMode && (
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Username unik"
            />
          </div>
        )}

        {/* Input Email */}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="contoh@email.com"
          />
        </div>

        {/* Input Password */}
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Minimal 6 karakter"
          />
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', marginTop: '10px' }}
        >
          {loading ? 'Memproses...' : (isRegisterMode ? 'Daftar Sekarang' : 'Masuk')}
        </button>

      </form>

      {/* Link Ganti Mode */}
      <p className="form-switch">
        {isRegisterMode ? 'Sudah punya akun?' : 'Belum punya akun?'}
        <span
          onClick={() => {
            setIsRegisterMode(!isRegisterMode);
            setError('');
          }}
          className="form-switch-link"
        >
          {isRegisterMode ? 'Login di sini' : 'Register di sini'}
        </span>
      </p>

    </div>
  );
}

export default LoginPage;