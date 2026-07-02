import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // الخيار الجديد للفلاتر (التابات)
  const [activeTab, setActiveTab] = useState('Sem 1'); 

  const studentCode = sessionStorage.getItem('current_student_code');

  useEffect(() => {
    if (!studentCode) {
      navigate('/student/login');
      return;
    }

    Promise.all([
      fetch('http://localhost:8080/api/students').then(res => res.json()),
      fetch('http://localhost:8080/api/courses').then(res => res.json())
    ])
      .then(([studentsData, coursesData]) => {
        const currentStudent = studentsData.find(s => s.student_code === studentCode);
        setStudentInfo(currentStudent || {
          full_name: "Academic Student",
          student_code: studentCode,
          national_number: "Not Available"
        });
        setCourses(coursesData || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, [studentCode, navigate]);

  // فلترة المواد بناءً على التاب اللي هو دايس عليه، واستبعاد السمر كورس من العرض العادي
  const displayedCourses = courses.filter(c => c.semester === activeTab && !c.is_summer_course);

  return (
    <div className="sd-wrapper">
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
        <button className="sd-logout-btn" onClick={() => { sessionStorage.clear(); navigate('/'); }}>
          Logout
        </button>
      </header>

      <main className="sd-main">
        <div className="sd-cards-row">
          <div className="sd-feature-card">
            <div className="sd-card-icon-wrap">
              <div className="sd-icon-grades">
                <div className="sd-grade-paper">
                  <span className="sd-grade-letter">A<sup>+</sup></span>
                  <div className="sd-paper-lines"><div /><div /><div /></div>
                </div>
              </div>
            </div>
            <div className="sd-card-body">
              <h2 className="sd-card-title">My Grades</h2>
              <p className="sd-card-desc">View your final grades and academic performance</p>
              <button className="sd-card-btn" onClick={() => navigate('/student/transcript')}>View Grades</button>
            </div>
          </div>

          <div className="sd-feature-card">
            <div className="sd-card-icon-wrap">
              <div className="sd-icon-schedule">
                <div className="sd-calendar">
                  <div className="sd-cal-header" />
                  <div className="sd-cal-grid">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className={`sd-cal-dot ${i === 4 ? 'sd-cal-dot-accent' : ''}`} />
                    ))}
                  </div>
                </div>
                <div className="sd-grad-cap">🎓</div>
              </div>
            </div>
            <div className="sd-card-body">
              <h2 className="sd-card-title">Academic Schedule</h2>
              <p className="sd-card-desc">Check your upcoming classes and exams</p>
              <button className="sd-card-btn" onClick={() => navigate('/student/schedule')}>View Schedule</button>
            </div>
          </div>
        </div>

        <div className="sd-table-section">
          <h3 className="sd-table-title">Student Registered Courses</h3>

          {/* زراير التابات الجديدة */}
          <div className="sd-tabs">
            <button className={`sd-tab-btn ${activeTab === 'Sem 1' ? 'active' : ''}`} onClick={() => setActiveTab('Sem 1')}>Semester 1</button>
            <button className={`sd-tab-btn ${activeTab === 'Sem 2' ? 'active' : ''}`} onClick={() => setActiveTab('Sem 2')}>Semester 2</button>
          </div>

          {loading ? (
            <div className="sd-loading">Loading academic records...</div>
          ) : (
            <table className="sd-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                </tr>
              </thead>
              <tbody>
                {displayedCourses.map((course) => (
                  <tr key={course.id}>
                    {/* التعديل هنا: استخدمنا course.id الفعلي من الداتابيز عشان الكود ميتكررش أبداً */}
                    <td>{`ICT ${220 + course.id}`}</td>
                    <td>{course.title}</td>
                  </tr>
                ))}
                {displayedCourses.length === 0 && (
                  <tr>
                    <td colSpan="2" className="sd-empty">No courses registered for this semester.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}