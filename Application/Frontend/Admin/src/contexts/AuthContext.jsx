import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [token, setToken] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    const storedToken = localStorage.getItem("authToken");
    if (loggedInStatus && storedUsername && storedToken) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setRole(storedRole || "");
      setToken(storedToken);
    } else {
      setIsLoggedIn(false);
      setUsername("");
      setRole("");
      setToken("");
    }
    setAuthLoading(false);
  }, []);

  const login = (name, userRole, token) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", name);
    localStorage.setItem("role", userRole || "Admin");
    if (token) localStorage.setItem("authToken", token);
    setIsLoggedIn(true);
    setUsername(name);
    setRole(userRole || "Admin");
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setUsername("");
    setRole("");
    setToken("");
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, username, role, token, login, logout, authLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
