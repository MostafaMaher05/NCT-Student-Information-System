import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // عملنا دالة منفصلة لجلب الكورسات عشان نقدر نناديها بعد أي أكشن (حذف أو إنشاء سمر)
  const fetchCourses = () => {
    fetch("http://localhost:8080/api/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = (courseId) => {
    if (window.confirm("Are you sure you want to delete this course completely?")) {
      fetch(`http://localhost:8080/api/courses/${courseId}`, {
        method: 'DELETE',
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to delete course");
          setCourses(courses.filter(c => c.id !== courseId));
          alert("✅ Course deleted successfully!");
        })
        .catch(err => alert("❌ Error deleting course: " + err.message));
    }
  };

  // الدالة الجديدة الخاصة بإنشاء السمر كورس للراسبين
  const handleGenerateSummerCourse = (courseId) => {
    if (window.confirm("Are you sure you want to generate a Summer Course? This will enroll ONLY failed students automatically.")) {
      fetch(`http://localhost:8080/api/courses/${courseId}/generate-summer`, {
        method: 'POST',
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to generate summer course");
          alert(`✅ ${data.message}\nFailed students enrolled: ${data.failed_students_enrolled}`);
          fetchCourses(); // تحديث قائمة الكورسات أوتوماتيك عشان الكورس الجديد يظهر
        })
        .catch(err => alert("❌ Error: " + err.message));
    }
  };

  return (
    <div className="admin-page-layout">
      <header className="page-header">
        <div className="header-left">
          <img src="/nctu-logo.png" alt="NCTU" className="header-logo" />
          <div className="header-text">
            <h1>Administrator Panel</h1>
            <p>System overview and active courses monitoring.</p>
          </div>
        </div>
        <button className="logout-btn" onClick={() => navigate('/login')}>
          Logout
        </button>
      </header>

      <main className="admin-dashboard-content">
        <section className="admin-hub-cards">

          {/* كارت إدارة الطلاب */}
          <div className="hub-card" onClick={() => navigate('/admin/manage-students')}>
            <div className="hub-card-icon">
              <img src="/manage-students.png" alt="Manage Students" className="illustration-img" />
            </div>
            <div className="hub-card-info">
              <h2>Manage Students</h2>
              <p>Add, edit, or remove students from the academic system</p>
              <button className="hub-action-btn">Manage Students</button>
            </div>
          </div>

          {/* كارت إنشاء الكورسات */}
          <div className="hub-card" onClick={() => navigate('/admin/manage-courses')}>
            <div className="hub-card-icon">
              <img src="/create-courses.png" alt="Create Courses" className="illustration-img" />
            </div>
            <div className="hub-card-info">
              <h2>Create Courses</h2>
              <p>Add Courses for the academic system with grading structure</p>
              <button className="hub-action-btn">Create Courses</button>
            </div>
          </div>

        </section>

        <section className="admin-active-courses-section">
          <h2 className="section-title">Your Active Courses</h2>

          {loading ? (
            <p>Loading courses...</p>
          ) : (
            <div className="admin-cards-grid">
              {courses.length > 0 ? (
                courses.map((course) => {
                  const classwork = course.total_grade - course.final_exam_grade;

                  return (
                    <article className="admin-course-card" key={course.id}>
                      <div className="admin-card-header-line" />

                      <div className="admin-course-header">
                        <h3 className="admin-course-title" title={course.title}>{course.title}</h3>
                        <div className="admin-course-tags">
                          {/* تمييز السمر كورس بتاج مختلف عشان يكون واضح للأدمن */}
                          {course.is_summer_course ? (
                            <span className="admin-tag" style={{ backgroundColor: '#fef08a', color: '#854d0e', border: '1px solid #eab308' }}>
                              Summer Edition
                            </span>
                          ) : (
                            <span className="admin-tag">
                              {course.semester === "Sem 1" ? "Semester 1" : "Semester 2"}
                            </span>
                          )}
                          <span className="admin-tag">Credits 3.0</span>
                        </div>
                      </div>

                      <div className="admin-grades-grid">
                        <div className="admin-grade-stat">
                          <span className="admin-stat-label">Total</span>
                          <span className="admin-stat-value">{course.total_grade}</span>
                        </div>
                        <div className="admin-grade-stat">
                          <span className="admin-stat-label">Classwork</span>
                          <span className="admin-stat-value">{classwork}</span>
                        </div>
                        <div className="admin-grade-stat">
                          <span className="admin-stat-label">Final</span>
                          <span className="admin-stat-value">{course.final_exam_grade}</span>
                        </div>
                      </div>

                      <div className="admin-card-actions">
                        <button
                          className="admin-grading-btn"
                          onClick={() => navigate(`/control/sheet/${course.id}`, { state: { readOnly: true } })}
                        >
                          Open Grading Sheet
                        </button>

                        {/* زرار المسح مع أيقونة الـ SVG المودرن */}
                        <button
                          className="admin-delete-btn"
                          onClick={() => handleDeleteCourse(course.id)}
                          title="Delete Course"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="modern-trash-icon">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>

                      {/* زرار إنشاء السمر كورس بيظهر بس للمواد العادية اللي الأدمن سامح لها بكده */}
                      {(!course.is_summer_course && course.has_summer_course !== false) && (
                        <button
                          onClick={() => handleGenerateSummerCourse(course.id)}
                          style={{
                            marginTop: '15px', width: '100%', backgroundColor: '#f59e0b', color: 'white', border: 'none', 
                            padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: '0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                        >
                          Generate Summer Course
                        </button>
                      )}

                    </article>
                  );
                })
              ) : (
                <p style={{ color: '#666' }}>No active courses found. Create one above!</p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}