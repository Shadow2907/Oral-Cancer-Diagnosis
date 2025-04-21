// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [gender, setGender] = useState(''); // Added gender

    // Load login state from localStorage on initial load
    useEffect(() => {
        const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
        const storedUsername = localStorage.getItem('username');
        const storedGender = localStorage.getItem('gender');
        if (loggedInStatus && storedUsername) {
            setIsLoggedIn(true);
            setUsername(storedUsername);
            setGender(storedGender || ''); // Load gender
        }
    }, []);

    const login = (name, userGender) => { // Accept gender on login/signup
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', name);
        localStorage.setItem('gender', userGender || ''); // Store gender
        setIsLoggedIn(true);
        setUsername(name);
        setGender(userGender || '');
        console.log("Logged in:", name, userGender); // Debug log
    };

    const logout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('gender'); // Remove gender
        setIsLoggedIn(false);
        setUsername('');
        setGender('');
        console.log("Logged out"); // Debug log
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, username, gender, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);