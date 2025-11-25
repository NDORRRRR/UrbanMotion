import axios from 'axios';

// Semua request akan otomatis dikirim ke sini
const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

// otomatis bawa "Tiket" (Token JWT) setiap kali kirim request

export default api;