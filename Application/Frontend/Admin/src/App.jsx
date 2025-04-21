import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Admin from './pages/Admin';

function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<Admin />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Admin />} />
    </Routes>
  );
}

export default App;