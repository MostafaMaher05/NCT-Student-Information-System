import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // إرسال الطلب للباك إند الخاص بالاستاف
    fetch('http://localhost:8080/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Invalid username or password');
        }
        return data;
      })
      .then((data) => {
        setLoading(false);
        // التوجيه بناءً على الصلاحية
        if (data.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.role === 'control') {
          navigate('/control/dashboard');
        } else {
          setError('Unknown role assigned to this user.');
        }
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message);
      });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo-container">
          <img src="/nctu-logo.png" alt="NCTU Logo" className="nctu-logo" />
        </div>
        <h1 className="login-title">Academic Access</h1>
        <p className="login-subtitle">Authorized staff only</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="***********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="error-message">⚠️ {error}</p>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
          
          <button type="button" className="back-to-home-btn" onClick={() => navigate('/')}>
            Back to Selection Portal
          </button>
        </form>
      </div>
    </div>
  );
}