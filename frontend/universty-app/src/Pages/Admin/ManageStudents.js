import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageStudents.css';

export default function ManageStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({
    student_code: '',
    full_name: '',
    national_number: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editCode, setEditCode] = useState(null);

  // State جديدة لعرض رسايل الخطأ للـ Validation
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStudents = () => {
    fetch('http://localhost:8080/api/students')
      .then(res => res.json())
      .then(data => setStudents(data || []))
      .catch(err => console.error("Error fetching students:", err));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(''); // تصفير الإيرور مع كل ضغطة زرار

    // ==========================================
    // 🛡️ الـ Validation (التحقق من صحة البيانات)
    // ==========================================

    // 1. التحقق من كود الطالب (أرقام فقط)
    const codeRegex = /^[0-9]+$/;
    if (!codeRegex.test(formData.student_code)) {
      setErrorMsg("Student Code must contain numbers only.");
      return;
    }

    // 2. التحقق من الاسم (حروف عربية أو إنجليزية ومسافات فقط، بدون أرقام)
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/;
    if (!nameRegex.test(formData.full_name)) {
      setErrorMsg("Full Name must contain letters only (No numbers or special characters).");
      return;
    }

    // 3. التحقق من الرقم القومي (14 رقم بالظبط)
    const nationalRegex = /^[0-9]{14}$/;
    if (!nationalRegex.test(formData.national_number)) {
      setErrorMsg("National Number must be exactly 14 digits.");
      return;
    }

    // لو كل الـ Validations عدت بسلام، نبعت للباك إند
    if (formData.student_code && formData.full_name && formData.national_number) {
      const url = isEditing
        ? `http://localhost:8080/api/students/${editCode}`
        : 'http://localhost:8080/api/students';

      const method = isEditing ? 'PUT' : 'POST';

      fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to save student");
          }
          return res.json();
        })
        .then(data => {
          fetchStudents();
          resetForm();
          alert(isEditing ? "✅ Student updated successfully!" : "✅ Student added successfully!");
        })
        .catch(err => {
          console.error("Error saving student:", err);
          setErrorMsg(err.message); // عرض إيرور الباك إند لو حصل (مثلاً الكود متكرر)
        });
    }
  };

  const handleEditClick = (student) => {
    setIsEditing(true);
    setEditCode(student.student_code);
    setFormData({
      student_code: student.student_code,
      full_name: student.full_name,
      national_number: student.national_number
    });
    setErrorMsg(''); // تصفير الإيرور لما يفتح التعديل
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditCode(null);
    setFormData({ student_code: '', full_name: '', national_number: '' });
    setErrorMsg('');
  };

  const handleDelete = (code) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      fetch(`http://localhost:8080/api/students/${code}`, {
        method: 'DELETE',
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to delete student");
          setStudents(students.filter(s => s.student_code !== code));
        })
        .catch(err => console.error("Error deleting student:", err));
    }
  };

  return (
    <div className="admin-page">
      <header className="page-header">
        <div className="header-left">
          <img src="/nctu-logo.png" alt="NCTU" className="header-logo" />
          <div className="header-text">
            <h1>Student Registry Management</h1>
            <p>Add, edit, or remove students from the academic system</p>
          </div>
        </div>
        <button className="logout-btn" onClick={() => navigate('/login')}>
          Logout
        </button>
      </header>

      <div className="management-content">
        <div className="registry-form-card">
          <h2>{isEditing ? 'Update Student' : 'Registry New Student'}</h2>

          <form onSubmit={handleSubmit}>
            <div className="admin-input-group">
              <label>Code</label>
              <input
                type="text"
                value={formData.student_code}
                onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                placeholder="202XXXXX"
                disabled={isEditing}
              />
            </div>
            <div className="admin-input-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Full Name"
              />
            </div>
            <div className="admin-input-group">
              <label>National Number</label>
              <input
                type="text"
                maxLength="14" // بيمنع يكتب أكتر من 14 رقم من الـ HTML
                value={formData.national_number}
                onChange={(e) => setFormData({ ...formData, national_number: e.target.value })}
                placeholder="14-Digit National ID"
              />
            </div>

            {/* عرض رسالة الخطأ لو موجودة */}
            {errorMsg && (
              <div style={{ color: '#e53e3e', fontSize: '14px', marginBottom: '15px', fontWeight: '500', padding: '10px', backgroundColor: '#fff5f5', borderRadius: '6px', borderLeft: '4px solid #e53e3e' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="registry-btn">
                {isEditing ? 'Save Changes' : 'Registry Student'}
              </button>

              {isEditing && (
                <button type="button" className="registry-btn" style={{ background: '#94a3b8' }} onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="students-table-card">
          <div className="table-header-info">
            <h2>Current Students ({students.length})</h2>
          </div>
          <table className="admin-table">
            <thead>
              <tr><th>Code</th><th>Full Name</th><th>National Number</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.student_code}>
                  <td className="fw-bold">{student.student_code}</td>
                  <td>{student.full_name}</td>
                  <td>{student.national_number}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEditClick(student)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(student.student_code)}>Delete</button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No students registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}