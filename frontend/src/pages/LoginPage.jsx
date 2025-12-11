import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(1);

  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (step === 1 && phone.length < 8) return setError("Nomor telepon tidak valid");
    if (step === 2 && (!username || !password)) return setError("Isi semua field");

    setError("");
    setStep(step + 1);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        fullname,
        email,
        username,
        password,
        dob
      });

      alert("Registrasi berhasil, silakan login!");
      setStep(2);
    } catch (err) {
      setError("Gagal daftar!");
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      setError("Login gagal, cek username & password");
    }
    setLoading(false);
  };

  return (
    <div className="login-container">

      {step === 1 && (
        <>
          <h2>Login or Register your Account</h2>
          <p>Fill your Phone Number</p>

          <div className="input-row">
            <span className="prefix">+62</span>
            <input 
              type="text"
              placeholder="Masukkan Nomor Telepon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <p className="switch" onClick={() => setStep(2)}>
            Login with Username
          </p>

          <button className="btn" onClick={handleContinue}>Continue</button>
        </>
      )}

      {step === 2 && (
        <>
          <h2>Login your Account</h2>
          <p>Fill your Username and Password</p>

          <input 
            type="text"
            placeholder="Masukkan Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input 
            type="password"
            placeholder="Masukkan Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p className="switch" onClick={() => setStep(1)}>
            Login or Register with Phone Number
          </p>

          <button className="btn" onClick={handleLogin}>
            {loading ? "Loading..." : "Continue"}
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h2>Fill your Information</h2>

          <input 
            placeholder="Input your Fullname"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
          />

          <input 
            placeholder="Input your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input 
            placeholder="Input Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input 
            type="password"
            placeholder="Input Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input 
            placeholder="DD/MM/YYYY"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />

          <button className="btn" onClick={handleRegister}>
            {loading ? "Loading..." : "Next"}
          </button>
        </>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default LoginPage;
