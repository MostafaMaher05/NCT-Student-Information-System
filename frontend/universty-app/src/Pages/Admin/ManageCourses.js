import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageCourses.css';

export default function ManageCourses() {
  const navigate = useNavigate();

  // State
  const [semester, setSemester] = useState('Sem 1');
  const [hasSummer, setHasSummer] = useState(true); // الخيار الجديد (Default: true)
  const [targetGrade, setTargetGrade] = useState(150);
  const [courseTitle, setCourseTitle] = useState('');
  const [finalExam, setFinalExam] = useState(60);
  const [activity, setActivity] = useState(30);
  const [assignments, setAssignments] = useState([
    { id: 1, grade: 60 }
  ]);

  // الحسابات والحماية
  const currentTotal = parseInt(finalExam || 0) + parseInt(activity || 0) +
    assignments.reduce((sum, asm) => sum + parseInt(asm.grade || 0), 0);

  const progressPercentage = Math.min((currentTotal / targetGrade) * 100, 100);
  const isOverLimit = currentTotal > targetGrade;
  const isValid = currentTotal === targetGrade;

  const addAssignment = () => {
    if (assignments.length < 2) {
      const maxId = assignments.length > 0 ? Math.max(...assignments.map(a => a.id)) : 0;
      setAssignments([...assignments, { id: maxId + 1, grade: 0 }]);
    }
  };

  const removeAssignment = (idToRemove) => {
    if (assignments.length > 1) {
      setAssignments(assignments.filter(asm => asm.id !== idToRemove));
    }
  };

  // دالة الإرسال للباك إند
  const handleLaunchCourse = () => {
    const payload = {
      title: courseTitle,
      semester: semester,
      has_summer_course: hasSummer, // بيبعت True أو False
      total_grade: targetGrade,
      final_exam_grade: parseInt(finalExam || 0),
      activity_grade: parseInt(activity || 0),
      assignments: assignments.map((asm, index) => ({
        assignment_name: `Assignment ${index + 1}`,
        grade: parseInt(asm.grade || 0)
      }))
    };

    fetch('http://localhost:8080/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to launch course");
        }
        return res.json();
      })
      .then(data => {
        alert("✅ Course and Assignments Launched Successfully!");
        setCourseTitle('');
        setFinalExam(60);
        setActivity(30);
        setAssignments([{ id: 1, grade: 60 }]);
        setTargetGrade(150);
        setHasSummer(true); // نرجع الديفولت
      })
      .catch(err => {
        console.error("Error launching course:", err);
        alert("❌ Error: " + err.message);
      });
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
            onClick={() => navigate('/admin/dashboard')}
          />
          <div className="header-text">
            <h1>Course Architect</h1>
            <p>Balanced Grading Structure Configuration</p>
          </div>
        </div>
        <button className="logout-btn" onClick={() => navigate('/login')}>
          Logout
        </button>
      </header>

      <div className="ca-single-card">
        <div className="ca-top-controls">
          <div className="ca-target-selector">
            <span className="ca-label">Course Total Grade:</span>
            <div className="ca-radio-pills">
              <button
                className={targetGrade === 100 ? 'active' : ''}
                onClick={() => setTargetGrade(100)}>
                100
              </button>
              <button
                className={targetGrade === 150 ? 'active' : ''}
                onClick={() => setTargetGrade(150)}>
                150
              </button>
            </div>
          </div>

          <div className="ca-total-display">
            <span className="ca-label">Current Total:</span>
            <span className={`ca-total-number ${isValid ? 'valid' : isOverLimit ? 'invalid' : ''}`}>
              {currentTotal} <span className="ca-target-slash">/ {targetGrade}</span>
            </span>
          </div>
        </div>

        <div className="ca-progress-container">
          <div
            className={`ca-progress-bar ${isOverLimit ? 'over-limit' : isValid ? 'valid' : ''}`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <hr className="ca-divider" />

        <div className="ca-course-main-row">
          <div className="ca-course-title-sec">
            <input
              type="text"
              className="ca-course-title-input"
              placeholder="Enter Course Title..."
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div className="ca-semester-radios">
                <label className={semester === 'Sem 1' ? 'active' : ''}>
                  <input type="radio" value="Sem 1" checked={semester === 'Sem 1'} onChange={(e) => setSemester(e.target.value)} />
                  Semester 1
                </label>
                <label className={semester === 'Sem 2' ? 'active' : ''}>
                  <input type="radio" value="Sem 2" checked={semester === 'Sem 2'} onChange={(e) => setSemester(e.target.value)} />
                  Semester 2
                </label>
                {/* شيلنا اختيار Summer من هنا عشان نعتمد على الـ Toggle بس */}
              </div>

              <div className="ca-summer-toggle-wrapper">
                <span className="ca-label" style={{ marginBottom: 0, marginRight: '10px' }}>Has Summer Edition?</span>
                <label className="ca-switch">
                  <input type="checkbox" checked={hasSummer} onChange={(e) => setHasSummer(e.target.checked)} />
                  <span className="ca-slider ca-round"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="ca-basic-grades">
            <div className="ca-grade-box">
              <span className="ca-grade-label">Final</span>
              <input type="number" className="ca-grade-input no-spinners" value={finalExam} onChange={(e) => setFinalExam(e.target.value)} />
            </div>
            <div className="ca-grade-box">
              <span className="ca-grade-label">Activity</span>
              <input type="number" className="ca-grade-input no-spinners" value={activity} onChange={(e) => setActivity(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="ca-assignments-section">
          <div className="ca-assignments-grid">
            {assignments.map((asm, index) => (
              <div className="ca-assignment-card" key={asm.id}>
                <span className="ca-asm-title">Assignment {index + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="number"
                    className="ca-asm-input no-spinners"
                    value={asm.grade}
                    onChange={(e) => {
                      const newAsm = [...assignments];
                      newAsm[index].grade = e.target.value;
                      setAssignments(newAsm);
                    }}
                  />
                  {assignments.length > 1 && (
                    <button
                      className="ca-modern-delete-btn"
                      onClick={() => removeAssignment(asm.id)}
                      title="Remove Assignment"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="delete-icon">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ca-footer-actions">
          <button
            className="ca-add-asm-btn"
            onClick={addAssignment}
            disabled={assignments.length >= 2}
          >
            + Add Assignment {assignments.length < 2 ? assignments.length + 1 : '(Max Reached)'}
          </button>
          <button
            className="ca-confirm-btn"
            onClick={handleLaunchCourse}
            disabled={!isValid || !courseTitle}
          >
            {isValid ? 'Confirm & Launch Course' : 'Resolve Errors to Launch'}
          </button>
        </div>

      </div>
    </div>
  );
}