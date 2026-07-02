import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// ==================== 1. Auth Pages ====================
import StartPage from './Pages/Auth/StartPage';
import Login from './Pages/Auth/Login';
import StudentLogin from './Pages/Auth/StudentLogin';

// ==================== 2. Admin Pages ====================
import AdminDashboard from './Pages/Admin/AdminDashboard';
import ManageStudents from './Pages/Admin/ManageStudents';
import ManageCourses from './Pages/Admin/ManageCourses';

// ==================== 3. Control Pages ====================
import ControlDashboard from './Pages/Control/ControlDashboard';
import ActiveCourses from './Pages/Control/ActiveCourses';
import GradingSheet from './Pages/Control/GradingSheet';

// ==================== 4. Students Pages ====================
import StudentDashboard from './Pages/Student/StudentDashboard';
import GradesTranscript from './Pages/Student/GradesTranscript';
import ClassSchedule from './Pages/Student/ClassSchedule';

function App() {
  return (
    <Router>
      <Routes>
        {/* ==================== Auth Routes ==================== */}
        <Route path="/" element={<StartPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student/login" element={<StudentLogin />} />

        {/* ==================== Admin Routes ==================== */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-students" element={<ManageStudents />} />
        <Route path="/admin/manage-courses" element={<ManageCourses />} />

        {/* ==================== Control Routes ==================== */}
        <Route path="/control/dashboard" element={<ControlDashboard />} />
        <Route path="/control/active-courses" element={<ActiveCourses />} />
        <Route path="/control/sheet/:courseId" element={<GradingSheet />} />

        {/* ==================== Student Routes ==================== */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/transcript" element={<GradesTranscript />} />
        <Route path="/student/schedule" element={<ClassSchedule />} />

        {/* ==================== Fallback Route ==================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;