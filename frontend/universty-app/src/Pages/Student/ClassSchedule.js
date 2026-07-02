import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ClassSchedule.css";

export default function ClassSchedule() {
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState(null);
  const studentCode = sessionStorage.getItem('current_student_code');

  useEffect(() => {
    if (!studentCode) { navigate('/student/login'); return; }

    fetch('http://localhost:8080/api/students')
      .then(r => r.json())
      .then(data => {
        const me = data.find(s => s.student_code === studentCode);
        setStudentInfo(me || { full_name: "Academic Student", student_code: studentCode, national_number: "N/A" });
      })
      .catch(() => { });
  }, [studentCode, navigate]);

  return (
    <div className="cs-wrapper">

      {/* ===== HEADER ===== */}
      <header className="sd-header">
        <div className="sd-header-logo">
          <img src="/nctu-logo.png" alt="NCTU" />
        </div>

        <div className="sd-header-center">
          <h1 className="sd-welcome">
            Welcome back, <span>{studentInfo?.full_name || "..."}</span>
          </h1>
          <div className="sd-meta">
            <span>Student Code: <strong>{studentInfo?.student_code || studentCode}</strong></span>
            <div className="sd-meta-divider" />
            <span>National ID: <strong>{studentInfo?.national_number || "..."}</strong></span>
          </div>
        </div>

        <button className="sd-logout-btn" onClick={() => { sessionStorage.clear(); navigate('/'); }} >
          Logout
        </button>
      </header>

      {/* ===== MAIN ===== */}
      <main className="cs-main">
        <div className="cs-card">
          <h2 className="cs-card-title">University Academic Timetables</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
            Access the official college cloud drive to view and download schedules for all academic years.
          </p>

          {/* منطقة التحميل - تم توجيهها للـ Drive الخارجي */}
          <div className="cs-file-area">
            {/* 💡 ملحوظة: استبدل الرابط اللي تحت ده بلينك فولدر الدرايف الفعلي بتاعكم */}
            <a 
              href="https://drive.google.com/file/d/1s6neVvb51stsRnfQ5EvKhdhlEcX6V27e/view?usp=sharing" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="cs-download-link" 
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              Open Academic Cloud Drive
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}