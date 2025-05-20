import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [token, setToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    const storedToken = localStorage.getItem("authToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (loggedInStatus && storedUsername && storedToken) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setRole(storedRole || "");
      setToken(storedToken);
      setRefreshToken(storedRefreshToken || "");
    } else {
      setIsLoggedIn(false);
      setUsername("");
      setRole("");
      setToken("");
      setRefreshToken("");
    }
    setAuthLoading(false);
  }, []);

  const login = (name, userRole, token, refreshTokenValue) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", name);
    localStorage.setItem("role", userRole || "Admin");
    if (token) localStorage.setItem("authToken", token);
    if (refreshTokenValue) localStorage.setItem("refreshToken", refreshTokenValue);
    setIsLoggedIn(true);
    setUsername(name);
    setRole(userRole || "Admin");
    setToken(token);
    setRefreshToken(refreshTokenValue);
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    setUsername("");
    setRole("");
    setToken("");
    setRefreshToken("");
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, username, role, token, refreshToken, login, logout, authLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
