import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false); 

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
    const storedUsername = localStorage.getItem("username");
    const storedGender = localStorage.getItem("gender");
    if (loggedInStatus && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setGender(storedGender || "");
    }
  }, []);

  const login = (name, userGender) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", name);
    localStorage.setItem("gender", userGender || "");
    setIsLoggedIn(true);
    setUsername(name);
    setGender(userGender || "");
    console.log("Logged in:", name, userGender);
  };

  const logout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      localStorage.removeItem("gender");
      localStorage.removeItem("authToken"); 
      localStorage.removeItem("authTokenExpire"); 
      setIsLoggedIn(false);
      setUsername("");
      setGender("");
      setIsLoggingOut(false);
      console.log("Logged out");
    }, 700);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, username, gender, login, logout, isLoggingOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
