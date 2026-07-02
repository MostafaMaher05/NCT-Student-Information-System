import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StartPage.css';

export default function StartPage() {
  const navigate = useNavigate();

  return (
    <div className="start-portal-premium-bg">
      <div className="start-portal-wrapper">
        
        {/* هيدر ترحيبي يحمل شعار الجامعة */}
        <header className="portal-premium-header">
          <img src="/nctu-logo.png" alt="NCTU Logo" className="portal-main-logo" />
          <h1>NCTU Student Information System</h1>
          <p>New Cairo Technological University Management System</p>
        </header>

        {/* كارتين بجانب بعضهما تماماً كما في التصميم */}
        <main className="portal-cards-row-container">
          
          {/* كارت بورتال الطلاب */}
          <div className="premium-selection-card" onClick={() => navigate('/student/login')}>
            <div className="premium-card-icon-box student-box-bg">
              <img src="/student.png" alt="Student Icon" />
            </div>
            <div className="premium-card-info">
              <h2>Student Portal</h2>
              <p>Access your grades transcript matrix, weekly class schedule, and personal registry profiles.</p>
            </div>
            <div className="premium-card-action">
              <span>Enter Student Portal</span>
            </div>
          </div>

          {/* كارت بورتال أعضاء هيئة التدريس والموظفين */}
          <div className="premium-selection-card" onClick={() => navigate('/login')}>
            <div className="premium-card-icon-box staff-box-bg">
              <img src="/staff.png" alt="Staff Icon" />
            </div>
            <div className="premium-card-info">
              <h2>Staff Portal</h2>
              <p>Centralized control panelRoom for entering grades, configuring courses, and student records management.</p>
            </div>
            <div className="premium-card-action">
              <span>Enter Staff Portal</span>
            </div>
          </div>

        </main>

        <footer className="portal-premium-footer">
          <p>&copy; {new Date().getFullYear()} NCTU Information & Communication Technology Department.</p>
        </footer>

      </div>
    </div>
  );
}