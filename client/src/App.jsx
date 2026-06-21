import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppShell from './components/AppShell';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import GradesPage from './pages/GradesPage';
import FinancePage from './pages/FinancePage';
import ModulePage from './pages/ModulePage';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

const MODULE_CONFIGS = {
  staff: { resource: 'staff', titleKey: 'nav.staff', fields: [
    { key: 'first_name', label: 'First name' }, { key: 'last_name', label: 'Last name' },
    { key: 'role', label: 'Role' }, { key: 'department', label: 'Department' }, { key: 'email', label: 'Email' },
  ] },
  classes: { resource: 'classes', titleKey: 'nav.classes', fields: [
    { key: 'name', label: 'Class / Program name' }, { key: 'level', label: 'Level' },
    { key: 'track_specialization', label: 'Track / Specialization' }, { key: 'capacity', label: 'Capacity', type: 'number' },
  ] },
  attendance: { resource: 'attendance', titleKey: 'nav.attendance', fields: [
    { key: 'student_id', label: 'Student ID' }, { key: 'class_program_id', label: 'Class ID' },
    { key: 'date', label: 'Date', type: 'date' }, { key: 'status', label: 'Status (present/absent/late)' },
  ] },
  admissions: { resource: 'admissions', titleKey: 'nav.admissions', fields: [
    { key: 'applicant_name', label: 'Applicant name' }, { key: 'desired_program', label: 'Desired program' },
    { key: 'guardian_contact', label: 'Guardian contact' }, { key: 'application_status', label: 'Status' },
  ] },
  documents: { resource: 'documents', titleKey: 'nav.documents', fields: [
    { key: 'student_id', label: 'Student ID' }, { key: 'document_type', label: 'Document type' },
    { key: 'reference_no', label: 'Reference No.' }, { key: 'status', label: 'Status' },
  ] },
  announcements: { resource: 'announcements', titleKey: 'nav.announcements', fields: [
    { key: 'title', label: 'Title' }, { key: 'body', label: 'Message' },
    { key: 'audience_role', label: 'Audience' }, { key: 'language', label: 'Language' },
  ] },
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="grades" element={<GradesPage />} />
        <Route path="finance" element={<FinancePage />} />
        {Object.entries(MODULE_CONFIGS).map(([path, cfg]) => (
          <Route key={path} path={path} element={<ModulePage {...cfg} />} />
        ))}
        <Route path="analytics" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
