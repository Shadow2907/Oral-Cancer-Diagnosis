// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
// Import Layouts and Pages
import MainLayout from "./layouts/MainLayout"; // Import layout mới
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import History from "./pages/History";
import Account from "./pages/Account";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OtpVerification from "./pages/OtpVerification";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
function App() {
  return (
    <Routes>
      {/* Routes sử dụng MainLayout */}
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path="/upload"
        element={
          <MainLayout>
            <Upload />
          </MainLayout>
        }
      />
      <Route
        path="/history"
        element={
          <MainLayout>
            <History />
          </MainLayout>
        }
      />
      <Route
        path="/account"
        element={
          <MainLayout>
            <Account />
          </MainLayout>
        }
      />
      <Route
        path="/change-password"
        element={
          <MainLayout>
            <ChangePassword />
          </MainLayout>
        }
        />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<OtpVerification />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;
