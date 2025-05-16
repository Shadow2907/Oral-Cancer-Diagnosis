import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AdminLayout from "../layouts/AdminLayout";
import SystemMonitoring from "./admin/SystemMonitoring";
import DiagnosisManagement from "./admin/DiagnosisManagement";
import UserManagement from "./admin/UserManagement";

const Admin = () => {
  const { isLoggedIn, role, authLoading } = useAuth();

  if (authLoading) {
    return <div>Đang kiểm tra đăng nhập...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  const isAdmin = role === "Admin";

  if (!isAdmin) {
    return <Navigate to="/login" />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="system" element={<SystemMonitoring />} />
        <Route path="diagnoses" element={<DiagnosisManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="/" element={<Navigate to="system" />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;
