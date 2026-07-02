import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./ActiveCourses.css";

export default function ActiveCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [semester, setSemester] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // حماية: تحويل أي قيمة غريبة (null/undefined) إلى false للكورسات القديمة
      const isSummer = course.is_summer_course === true;

      // 1. فلتر التيرم
      let matchSemester = true;
      if (semester === "Summer") {
        matchSemester = isSummer; // لو اختار سمر، هات السمر كورس بس
      } else if (semester !== "") {
        // لو اختار Sem 1 أو Sem 2، هاتهم بشرط إنهم ميكونوش سمر كورس
        matchSemester = (course.semester === semester) && !isSummer;
      }

      // 2. فلتر البحث
      const q = search.trim().toLowerCase();
      const matchSearch =
        q === "" ||
        (course.title && course.title.toLowerCase().includes(q)) ||
        (course.semester && course.semester.toLowerCase().includes(q));

      return matchSemester && matchSearch;
    });
  }, [courses, semester, search]);

  const toggleSemester = (selected) => {
    setSemester(semester === selected ? "" : selected);
  };

  return (
    <div className="admin-page-layout">
      <header className="page-header">
        <div className="header-left">
          <img
            src="/nctu-logo.png"
            alt="NCTU"
            className="header-logo"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/control/dashboard')}
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

      <section className="ac-controls-row">
        <div className="ac-semester-group">
          {["Sem 1", "Sem 2", "Summer"].map((sem) => (
            <button
              key={sem}
              className={`ac-semester-btn ${semester === sem ? "active" : ""}`}
              onClick={() => toggleSemester(sem)}
            >
              {sem === "Sem 1" ? "Semester 1" : sem === "Sem 2" ? "Semester 2" : "Summer Course"}
            </button>
          ))}
        </div>

        <div className="ac-search-box">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Course Code or Name"
          />
          <svg viewBox="0 0 24 24" aria-hidden="true" className="ac-search-icon">
            <circle cx="11" cy="11" r="7.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      <main className="ac-content">
        <h2 className="ac-section-title">Active Courses</h2>

        {loading ? (
          <p>Loading active courses...</p>
        ) : (
          <div className="ac-cards-grid">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => {
                const classwork = course.total_grade - course.final_exam_grade;

                return (
                  <article className="ac-course-card" key={course.id}>
                    <div className="ac-card-header-line" />

                    <div className="ac-course-header">
                      <h3 className="ac-course-title" title={course.title}>{course.title}</h3>
                      <div className="ac-course-tags">
                        {/* لو هو سمر كورس هيتكتب عليه "Summer Edition" بلون مميز عشان بتاع الكنترول يلمحه */}
                        {course.is_summer_course ? (
                          <span className="ac-tag" style={{ backgroundColor: '#fef08a', color: '#854d0e', border: '1px solid #eab308' }}>
                            Summer Edition
                          </span>
                        ) : (
                          <span className="ac-tag">
                            {course.semester === "Sem 1" ? "Semester 1" : "Semester 2"}
                          </span>
                        )}
                        <span className="ac-tag">Credits 3.0</span>
                      </div>
                    </div>

                    <div className="ac-grades-grid">
                      <div className="ac-grade-stat">
                        <span className="ac-stat-label">Total</span>
                        <span className="ac-stat-value">{course.total_grade}</span>
                      </div>
                      <div className="ac-grade-stat">
                        <span className="ac-stat-label">Classwork</span>
                        <span className="ac-stat-value">{classwork}</span>
                      </div>
                      <div className="ac-grade-stat">
                        <span className="ac-stat-label">Final</span>
                        <span className="ac-stat-value">{course.final_exam_grade}</span>
                      </div>
                    </div>

                    <button
                      className="ac-grading-btn"
                      onClick={() => navigate(`/control/sheet/${course.id}`)}
                    >
                      Open Grading Sheet
                    </button>
                    {/* مفيش هنا أي زراير لإنشاء السمر كورس للكنترول! */}
                  </article>
                );
              })
            ) : (
              <p style={{ color: '#666' }}>No active courses found for this selection.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}