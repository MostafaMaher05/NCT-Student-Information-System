import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GradesTranscript.css";

function getAppreciation(score, total) {
  if (score === "Pending") return { label: "Pending", cls: "appr-pending" };
  const pct = (score / total) * 100;
  if (pct >= 90) return { label: "excellent",  cls: "appr-excellent" };
  if (pct >= 75) return { label: "very good",  cls: "appr-verygood"  };
  if (pct >= 60) return { label: "good",        cls: "appr-good"      };
  if (pct >= 50) return { label: "pass",        cls: "appr-pass"      };
  return           { label: "fail",             cls: "appr-fail"      };
}

export default function GradesTranscript() {
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);
  
  // الخيار الجديد للفلاتر (التابات)
  const [activeTab, setActiveTab] = useState('Sem 1');

  const studentCode = sessionStorage.getItem('current_student_code');

  useEffect(() => {
    if (!studentCode) { navigate('/student/login'); return; }

    const fetchRealGrades = async () => {
      try {
        const studentsRes = await fetch('http://localhost:8080/api/students');
        const studentsData = await studentsRes.json();
        const me = studentsData.find(s => s.student_code === studentCode);
        setStudentInfo(me || { full_name: "Academic Student", student_code: studentCode, national_number: "N/A" });

        const coursesRes = await fetch('http://localhost:8080/api/courses');
        const coursesData = await coursesRes.json();

        const data = [];
        
        for (let i = 0; i < coursesData.length; i++) {
          const course = coursesData[i];
          let score = "Pending";
          let isEnrolled = true; // بنفترض إنه متسجل في العادي

          try {
            // سحب الدرجات من قاعدة البيانات الحقيقية
            const gradesRes = await fetch(`http://localhost:8080/api/courses/${course.id}/grades`);
            if (gradesRes.ok) {
              const courseGrades = await gradesRes.json();
              const parsed = courseGrades[studentCode];

              // لو الكورس ده سمر كورس والطالب ده مش موجود في لستة درجاته (يعني مش ساقط فيه)
              if (course.is_summer_course && !parsed) {
                isEnrolled = false; 
              }

              if (parsed) {
                let total = (parsed.finalExam || 0) + (parsed.activity || 0);
                Object.keys(parsed).forEach(k => {
                  if (k.startsWith('asm_')) total += (parsed[k] || 0);
                });
                const passMark = course.total_grade * 0.5;
                // تطبيق رأفة 5 درجات في العرض للطالب كمان
                if (total < passMark && (passMark - total) <= 5) total = passMark;
                score = total;
              }
            } else if (course.is_summer_course) {
               isEnrolled = false;
            }
          } catch (err) {
            if (course.is_summer_course) isEnrolled = false;
          }

          // هنضيف المادة للسجل بتاعه بس لو هو مسجل فيها
          if (isEnrolled) {
            data.push({
              ...course,
              // 🚀 التعديل هنا: استخدمنا course.id عشان الكود يبقى موحد في كل الصفحات
              course_code: course.course_code || `ICT ${220 + course.id}`,
              score,
            });
          }
        }

        setTranscript(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchRealGrades();
  }, [studentCode, navigate]);

  // فلترة السجل بناءً على التاب
  const displayedTranscript = transcript.filter(t => {
    if (activeTab === 'Summer') return t.is_summer_course === true;
    return t.semester === activeTab && !t.is_summer_course;
  });

  return (
    <div className="gt-wrapper">
      <header className="sd-header">
        <div className="sd-header-logo"><img src="/nctu-logo.png" alt="NCTU" /></div>
        <div className="sd-header-center">
          <h1 className="sd-welcome">Welcome back, <span>{studentInfo?.full_name || "..."}</span></h1>
          <div className="sd-meta">
            <span>Student Code: <strong>{studentInfo?.student_code || studentCode}</strong></span>
            <div className="sd-meta-divider" />
            <span>National ID: <strong>{studentInfo?.national_number || "..."}</strong></span>
          </div>
        </div>
        <button className="sd-logout-btn" onClick={() => { sessionStorage.clear(); navigate('/'); }}>Logout</button>
      </header>

      <main className="gt-main">
        <div className="gt-card">
          <h2 className="gt-card-title">My Detailed Grades Transcript</h2>

          {/* زراير الفلترة الجديدة */}
          <div className="gt-tabs">
            <button className={`gt-tab-btn ${activeTab === 'Sem 1' ? 'active' : ''}`} onClick={() => setActiveTab('Sem 1')}>Semester 1</button>
            <button className={`gt-tab-btn ${activeTab === 'Sem 2' ? 'active' : ''}`} onClick={() => setActiveTab('Sem 2')}>Semester 2</button>
            <button className={`gt-tab-btn ${activeTab === 'Summer' ? 'active' : ''}`} onClick={() => setActiveTab('Summer')}>Summer Courses</button>
          </div>

          {loading ? (
            <p className="gt-loading">Loading transcript records...</p>
          ) : (
            <table className="gt-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Final Grade</th>
                  <th>Student Grade</th>
                  <th>Appreciation</th>
                </tr>
              </thead>
              <tbody>
                {displayedTranscript.map((t, idx) => {
                  const appr = getAppreciation(t.score, t.total_grade);
                  return (
                    <tr key={idx}>
                      <td>{t.course_code}</td>
                      <td>{t.title}</td>
                      <td>{t.total_grade}</td>
                      <td className="gt-score">
                        {t.score === "Pending" ? <span className="gt-pending">—</span> : t.score}
                      </td>
                      <td>
                        <span className={`gt-appr ${appr.cls}`}>{appr.label}</span>
                      </td>
                    </tr>
                  );
                })}
                
                {/* رسالة الاحتفال لو معليهوش سمر كورس */}
                {displayedTranscript.length === 0 && activeTab === 'Summer' && (
                  <tr>
                    <td colSpan="5" className="gt-empty" style={{color: '#065f46', backgroundColor: '#d1fae5', padding: '25px', fontWeight: 'bold', fontSize: '16px'}}>
                      🎉 Congratulations! You don't have any summer courses. Keep up the great work!
                    </td>
                  </tr>
                )}

                {/* رسالة لو الترم لسه فاضي */}
                {displayedTranscript.length === 0 && activeTab !== 'Summer' && (
                  <tr>
                    <td colSpan="5" className="gt-empty">No courses found for this semester.</td>
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