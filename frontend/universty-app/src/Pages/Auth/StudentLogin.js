import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentLogin.css';

export default function StudentLogin() {
  const [studentCode, setStudentCode] = useState('');
  const [password, setPassword] = useState(''); // الباسورد هنا هو الرقم القومي
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // ==========================================
    // 1. Client-Side Validation (التحقق قبل السيرفر)
    // ==========================================
    
    // التأكد من إدخال كود الطالب
    if (!studentCode.trim()) {
      setError('Please enter your Academic Student Code.');
      return;
    }

    // التأكد من إدخال الرقم القومي
    if (!password.trim()) {
      setError('Please enter your National Number.');
      return;
    }

    // التأكد إن الرقم القومي 14 رقم بالظبط وأرقام فقط
    if (password.trim().length < 14 || !/^\d+$/.test(password.trim())) {
      setError('National Number must be 14 digits.');
      return;
    }

    // لو كل البيانات سليمة، نبدأ التحميل ونكلم السيرفر
    setLoading(true);

    // ==========================================
    // 2. Fetching from API
    // ==========================================
    fetch('http://localhost:8080/api/students')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to connect to the server');
        }
        return await res.json();
      })
      .then((students) => {
        setLoading(false);
        
        // مطابقة كود الطالب والرقم القومي (الباسورد) مع الداتابيز
        const validStudent = students.find(
          (student) => student.student_code === studentCode.trim() && student.national_number === password.trim()
        );

        if (validStudent) {
          // حفظ الكود في الجلسة والتوجيه لداشبورد الطالب
          sessionStorage.setItem('current_student_code', studentCode.trim());
          navigate('/student/dashboard');
        } else {
          setError('Invalid Student Code or National Number');
        }
      })
      .catch((err) => {
        setLoading(false);
        setError('Server Error: Could not fetch student records.');
      });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo-container">
          <img src="/nctu-logo.png" alt="NCTU Logo" className="nctu-logo" />
        </div>
        <h1 className="login-title">Student Access</h1>
        <p className="login-subtitle">Secure student portal sign in</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Academic Student Code</label>
            <input
              type="text"
              placeholder="e.g. 202XXXXX"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>National Number (Password)</label>
            <input
              type="password"
              placeholder="Enter your 14-digit National ID"
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