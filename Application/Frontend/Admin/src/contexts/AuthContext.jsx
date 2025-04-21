import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    if (loggedInStatus && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setRole(storedRole || '');
    }
  }, []);

  const login = (name, userRole) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', name);
    localStorage.setItem('role', userRole || 'Admin');
    setIsLoggedIn(true);
    setUsername(name);
    setRole(userRole || 'Admin');
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUsername('');
    setRole('');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);