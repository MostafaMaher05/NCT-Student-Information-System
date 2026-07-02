import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ControlDashboard.css';

export default function ControlDashboard() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [studentInfo, setStudentInfo] = useState(null); 
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setError('');
    setStudentInfo(null);
    setRegisteredCourses([]);

    try {
      // 1. جلب كل الطلاب والبحث عن الطالب المطلوب
      const studentsRes = await fetch('http://localhost:8080/api/students');
      if (!studentsRes.ok) throw new Error("Failed to fetch students");
      const students = await studentsRes.json();

      const query = searchQuery.trim().toLowerCase();
      const foundStudent = students.find(
        s => s.student_code.toLowerCase() === query ||
          s.full_name.toLowerCase().includes(query)
      );

      if (!foundStudent) {
        throw new Error("No student found with this name or code.");
      }

      setStudentInfo(foundStudent); 

      // 2. جلب كل الكورسات
      const coursesRes = await fetch('http://localhost:8080/api/courses');
      if (!coursesRes.ok) throw new Error("Failed to fetch courses");
      const courses = await coursesRes.json();

      const formattedCourses = [];

      // 3. مطابقة الكورسات مع درجات الطالب من الداتابيز الحقيقية
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        let finalGrade = "Pending";
        let finalStatus = "Registered";
        let isEnrolled = true; 

        try {
          const gradesRes = await fetch(`http://localhost:8080/api/courses/${course.id}/grades`);
          if (gradesRes.ok) {
            const courseGrades = await gradesRes.json();
            const studentGrades = courseGrades[foundStudent.student_code];

            // لو الكورس سمر والطالب ملوش درجات فيه (يعني مش ساقط فيه)، نستبعده
            if (course.is_summer_course && !studentGrades) {
              isEnrolled = false; 
            }

            if (studentGrades) {
              let total = (studentGrades.finalExam || 0) + (studentGrades.activity || 0);
              Object.keys(studentGrades).forEach(key => {
                if (key.startsWith('asm_')) total += (studentGrades[key] || 0);
              });

              // حساب النجاح والرأفة
              const passingMark = course.total_grade * 0.5;
              if (total < passingMark && passingMark - total <= 5) {
                total = passingMark; // إضافة الرأفة
              }

              finalGrade = total;
              finalStatus = total >= passingMark ? "Pass" : "Fail";
            }
          } else if (course.is_summer_course) {
            isEnrolled = false;
          }
        } catch (err) {
          if (course.is_summer_course) isEnrolled = false;
        }

        // لو الطالب مسجل (مادة عادية، أو سمر هو ساقط فيه)، نضيفه للجدول
        if (isEnrolled) {
          formattedCourses.push({
            code: `ICT ${220 + course.id}`, // الكود الموحد بتاعنا
            name: course.title,
            credits: "3.0",
            grade: finalGrade,
            status: finalGrade === "Pending" ? "Registered" : finalStatus
          });
        }
      }

      setRegisteredCourses(formattedCourses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div className="header-left">
          <img
            src="/nctu-logo.png"
            alt="NCTU"
            className="header-logo"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/login')}
          />
          <div className="header-text">
            <h1>Control Panel</h1>
            <p>System overview and active courses monitoring.</p>
          </div>
        </div>
        <button className="logout-btn" onClick={() => navigate('/login')}>
          Logout
        </button>
      </header>

      <div className="hub-container_control">

        {/* كارت إدخال الدرجات */}
        <div className="control-left-card">
          <div className="control-icon-large">
            <img src="/exam.png" alt="Grades" style={{ width: '100px' }} />
          </div>
          <div className="control-card-text">
            <h2>Grades Entry</h2>
            <p>Enter student grades for different courses</p>
            <button className="control-action-btn" onClick={() => navigate('/control/active-courses')}>
              Open Grade Sheets
            </button>
          </div>
        </div>

        {/* كارت البحث الأكاديمي */}
        <div className="control-search-card">
          <h2>Student Academic Search</h2>

          <form onSubmit={handleSearch} className="search-bar-container">
            <input
              type="text"
              placeholder="Enter student name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-icon-btn">🔍</button>
          </form>

          <div className="statement-header">
            <h3>Student Registered Courses Statement</h3>
            <p>View registered courses and grades</p>
          </div>

          {/* عرض اسم الطالب اللي تم البحث عنه لو موجود */}
          {studentInfo && (
            <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #14b8a6', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', color: '#0f766e', fontWeight: 'bold' }}>
              Showing results for: {studentInfo.full_name} ({studentInfo.student_code})
            </div>
          )}

          <div className="table-responsive">
            <table className="control-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Credits</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="empty-state">Searching database...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="empty-state error-text">{error}</td>
                  </tr>
                ) : !hasSearched ? (
                  <tr>
                    <td colSpan="5" className="empty-state italic-text">
                      Use the search bar above to fetch and view student courses.
                    </td>
                  </tr>
                ) : (
                  registeredCourses.map((c, i) => (
                    <tr key={i}>
                      <td className="fw-bold text-primary">{c.code}</td>
                      <td className="text-dark" style={{ textAlign: 'left', paddingLeft: '20px', fontWeight: 'bold' }}>{c.name}</td>
                      <td className="text-muted">{c.credits}</td>
                      <td style={{ fontWeight: 'bold', color: c.grade !== 'Pending' ? '#0f172a' : '#94a3b8' }}>
                        {c.grade}
                      </td>
                      <td>
                        <span className={`status-pill ${c.status.toLowerCase()}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}