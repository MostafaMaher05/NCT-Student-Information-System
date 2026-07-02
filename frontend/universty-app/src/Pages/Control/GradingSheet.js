import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./GradingSheet.css";

export default function GradingSheet() {
  const { courseId } = useParams();
  const location = useLocation();
  const isReadOnly = location.state?.readOnly || false;

  const [courseInfo, setCourseInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [localGrades, setLocalGrades] = useState({});
  const [loading, setLoading] = useState(true);

  // 1. فصلنا دالة جلب البيانات بره عشان نقدر نستخدمها أكتر من مرة
  const loadSheetData = useCallback(async () => {
    setLoading(true); 
    try {
      const courseRes = await fetch("http://localhost:8080/api/courses");
      const coursesData = await courseRes.json();
      const currentCourse = coursesData.find(c => c.id === parseInt(courseId));

      if (!currentCourse) {
        alert("Course not found!");
        setLoading(false);
        return;
      }

      setCourseInfo({
        title: currentCourse.title,
        total: currentCourse.total_grade,
        exam: currentCourse.final_exam_grade,
        activity: currentCourse.activity_grade,
      });

      let finalAsmsToUse = [];
      const dbAssignments = currentCourse.assignments || currentCourse.Assignments;

      if (dbAssignments && dbAssignments.length > 0) {
        finalAsmsToUse = dbAssignments.map((asm, idx) => {
          const asmMax = asm.grade || asm.Grade || asm.max_grade || asm.MaxGrade || 0;
          const asmName = asm.assignment_name || asm.AssignmentName || asm.Assignment_name || `Assignment ${idx + 1}`;

          return {
            id: `asm_${idx + 1}`,
            name: asmName,
            max: parseInt(asmMax)
          };
        });
      } else {
        const totalAsmGrade = currentCourse.total_grade - (currentCourse.final_exam_grade + currentCourse.activity_grade);
        const asmCount = totalAsmGrade > 63 ? 2 : 1;
        const mockAsmWeight = totalAsmGrade > 63 ? totalAsmGrade / 2 : totalAsmGrade;

        for (let i = 1; i <= asmCount; i++) {
          finalAsmsToUse.push({ id: `asm_${i}`, name: `Assignment ${i}`, max: mockAsmWeight });
        }
      }

      setAssignments(finalAsmsToUse);

      // ==========================================
      // جلب قائمة الطلاب بذكاء بناءً على نوع الكورس
      // ==========================================
      let studentsUrl = "http://localhost:8080/api/students"; // الديفولت: كل الطلبة للكورسات العادية
      
      if (currentCourse.is_summer_course) {
        studentsUrl = `http://localhost:8080/api/courses/${courseId}/students`;
      }

      const studentsRes = await fetch(studentsUrl);
      const studentsData = await studentsRes.json();

      if (!studentsRes.ok || !studentsData) {
        setStudents([]);
      } else {
        setStudents(studentsData);
      }
      // ==========================================

      // ==========================================
      // 🚀 جلب الدرجات من الداتابيز مباشرة
      // ==========================================
      let dbGrades = {};
      try {
        const gradesRes = await fetch(`http://localhost:8080/api/courses/${courseId}/grades`);
        if (gradesRes.ok) {
          dbGrades = await gradesRes.json();
        }
      } catch (err) {
        console.error("No existing grades found in DB.");
      }

      // تجهيز الكيان المبدئي للدرجات
      const initialGradesObj = {};
      (studentsData || []).forEach(student => {
        // لو الطالب ليه درجات في الداتابيز هاتها، لو مفيش حط أصفار
        if (dbGrades[student.student_code]) {
          initialGradesObj[student.student_code] = dbGrades[student.student_code];
        } else {
          initialGradesObj[student.student_code] = {
            finalExam: 0,
            activity: 0,
            ...finalAsmsToUse.reduce((acc, col) => ({ ...acc, [col.id]: 0 }), {})
          };
        }
      });

      // لو الكنترول كان بيكتب درجات والنت فصل، הـ LocalStorage هيفضل محتفظ بيهم
      const savedDraft = localStorage.getItem(`draft_grades_course_${courseId}`);
      if (savedDraft) {
        setLocalGrades(JSON.parse(savedDraft));
      } else {
        setLocalGrades(initialGradesObj);
      }
      // ==========================================

      setLoading(false);
    } catch (err) {
      console.error("Error loading grading sheet:", err);
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadSheetData();
  }, [loadSheetData]);

  const handleGradeChange = (studentCode, field, value) => {
    let numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) numValue = 0;

    let maxLimit = courseInfo.total;
    if (field === "finalExam") maxLimit = courseInfo.exam;
    if (field === "activity") maxLimit = courseInfo.activity;
    if (field.startsWith("asm_")) {
      const targetAsm = assignments.find(a => a.id === field);
      if (targetAsm) maxLimit = targetAsm.max;
    }

    if (numValue > maxLimit) numValue = maxLimit;

    setLocalGrades((prev) => {
      const newState = {
        ...prev,
        [studentCode]: { ...prev[studentCode], [field]: numValue }
      };
      localStorage.setItem(`draft_grades_course_${courseId}`, JSON.stringify(newState));
      return newState;
    });
  };

  const calculateStudentFinals = (studentCode) => {
    const grades = localGrades[studentCode] || {};

    const asmTotal = assignments.reduce((sum, col) => sum + (parseInt(grades[col.id]) || 0), 0);
    const activity = parseInt(grades.activity) || 0;
    const finalExam = parseInt(grades.finalExam) || 0;

    const baseTotal = asmTotal + activity + finalExam;
    const passingMark = courseInfo.total * 0.5;

    let graceMarks = 0;
    let finalTotal = baseTotal;
    let status = "Fail";

    if (baseTotal >= passingMark) {
      status = "Pass";
    } else {
      const shortfall = passingMark - baseTotal;
      if (shortfall <= 5) {
        graceMarks = shortfall;
        finalTotal = passingMark;
        status = "Pass";
      }
    }

    const percentage = ((finalTotal / courseInfo.total) * 100).toFixed(2);
    return { totalGrade: finalTotal, percentage, status, graceMarks };
  };

  const handleExportExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";

    const headers = [
      "Student Code",
      "Student Name",
      ...assignments.map(a => a.name),
      "Activity",
      "Final Exam",
      "Total Grade",
      "Percentage",
      "Status",
      "Grace Marks"
    ];

    csvContent += headers.join(",") + "\r\n";

    students.forEach(student => {
      const { totalGrade, percentage, status, graceMarks } = calculateStudentFinals(student.student_code);
      const grades = localGrades[student.student_code] || {};

      const row = [
        student.student_code,
        student.full_name,
        ...assignments.map(a => grades[a.id] || 0),
        grades.activity || 0,
        grades.finalExam || 0,
        totalGrade,
        `${percentage}%`,
        status,
        graceMarks
      ];

      csvContent += row.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);

    const fileName = courseInfo && courseInfo.title ? `${courseInfo.title.replace(/\s+/g, '_')}_Grades_Sheet.csv` : "Grades_Sheet.csv";
    link.setAttribute("download", fileName);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. 🚀 دالة Sync Changes המحدثة: حفظ الدرجات في قاعدة البيانات الحقيقية
  const handleSync = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/courses/${courseId}/grades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localGrades)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save to database");

      // بمجرد ما الداتا اتحفظت في الداتابيز، نمسح الدرفت المؤقت من البراوزر عشان نبدأ على نظافة
      localStorage.removeItem(`draft_grades_course_${courseId}`);
      
      alert("✅ Data Synced and Saved to Master Database Successfully!");
      await loadSheetData(); // ريفرش للصفحة عشان تقرأ الدرجات النظيفة من الداتابيز
      
    } catch(err) {
      console.error("Failed to save to database", err);
      alert("❌ Sync Failed: " + err.message);
    }
  };

  if (loading) return <div className="grading-page-layout"><p>Loading Grading Matrix...</p></div>;

  const staticColumnsWidth = 78;
  const remainingWidth = 100 - staticColumnsWidth;
  const assignmentWidth = assignments.length > 0 ? remainingWidth / assignments.length : 0;

  return (
    <div className="grading-page-layout">
      <div className="course-header-card">
        <div className="course-info-section">
          <div className="course-title-row">
            <h1 className="course-main-title">{courseInfo.title}</h1>
            <span className="course-max-text">{courseInfo.total}</span>
          </div>
          <div className="course-badges-row">
            <span className="course-outline-badge">Final Exam Max: {courseInfo.exam}</span>
            <span className="course-outline-badge">Activity Max: {courseInfo.activity}</span>
            {assignments.map(a => (
              <span key={a.id} className="course-outline-badge">{a.name} Max: {a.max}</span>
            ))}
          </div>
        </div>

        <div className="course-actions-section">
          <button className="btn-excel" onClick={handleExportExcel}>Export to Excel</button>
          {/* إخفاء زرار السينك لو اليوزر أدمن (قراءة فقط) */}
          {!isReadOnly && (
            <button className="btn-sync" onClick={handleSync}>Sync Changes</button>
          )}
        </div>
      </div>

      <div className="grading-table-card">
        <div className="table-responsive">
          <table className="grading-sheet-table">
            <colgroup>
              <col style={{ width: "10%" }} />
              <col style={{ width: "18%" }} />
              {assignments.map(a => <col key={a.id} style={{ width: `${assignmentWidth}%` }} />)}
              <col style={{ width: "8%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "9%" }} />
            </colgroup>

            <thead>
              <tr className="main-header">
                <th rowSpan="2" className="dark-th text-center">Student Code</th>
                <th rowSpan="2" className="dark-th text-left px-20">Student Name</th>
                {assignments.map((col) => (
                  <th rowSpan="2" key={col.id} className="dark-th">{col.name}</th>
                ))}
                <th rowSpan="2" className="dark-th">Activity</th>
                <th rowSpan="2" className="dark-th">Final Exam</th>
                <th colSpan="4" className="teal-th">Result Matrix</th>
              </tr>
              <tr className="sub-header">
                <th className="matrix-sub-th">TOTAL GRADE</th>
                <th className="matrix-sub-th">PERCENTAGE</th>
                <th className="matrix-sub-th">STATUS</th>
                <th className="matrix-sub-th">GRACE MARKS</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => {
                const { totalGrade, percentage, status, graceMarks } = calculateStudentFinals(student.student_code);
                const studentGrades = localGrades[student.student_code] || {};

                return (
                  <tr key={student.student_code} className="grading-row">
                    <td className="fw-bold text-center text-primary code-cell">
                      {student.student_code}
                    </td>
                    <td className="text-left px-20 fw-bold name-cell">
                      {student.full_name}
                    </td>
                    {assignments.map((col) => (
                      <td key={col.id}>
                        <input
                          type="number"
                          className="grade-input no-spinners"
                          disabled={isReadOnly}
                          value={studentGrades[col.id] === 0 && studentGrades[col.id] !== "0" ? "" : studentGrades[col.id]}
                          onChange={(e) => handleGradeChange(student.student_code, col.id, e.target.value)}
                          placeholder="0"
                        />
                      </td>
                    ))}
                    <td>
                      <input
                        type="number"
                        className="grade-input no-spinners"
                        disabled={isReadOnly}
                        value={studentGrades.activity === 0 ? "" : studentGrades.activity}
                        onChange={(e) => handleGradeChange(student.student_code, "activity", e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="grade-input no-spinners"
                        disabled={isReadOnly}
                        value={studentGrades.finalExam === 0 ? "" : studentGrades.finalExam}
                        onChange={(e) => handleGradeChange(student.student_code, "finalExam", e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td className="fw-bold text-center total-cell">{totalGrade}</td>
                    <td className="text-center fw-bold percentage-cell">{percentage}%</td>
                    <td className="text-center fw-bold">
                      <span className={`status-pill ${status.toLowerCase()}`}>{status}</span>
                    </td>
                    <td className={`fw-bold text-center grace-cell ${graceMarks > 0 ? 'has-grace' : ''}`}>
                      {graceMarks > 0 ? `+${graceMarks}` : '0'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}