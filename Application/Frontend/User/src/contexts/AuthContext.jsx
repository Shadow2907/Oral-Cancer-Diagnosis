import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [gender, setGender] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false); // Thêm state loading

    useEffect(() => {
        const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
        const storedUsername = localStorage.getItem('username');
        const storedGender = localStorage.getItem('gender');
        if (loggedInStatus && storedUsername) {
            setIsLoggedIn(true);
            setUsername(storedUsername);
            setGender(storedGender || '');
        }
    }, []);

    const login = (name, userGender) => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', name);
        localStorage.setItem('gender', userGender || '');
        setIsLoggedIn(true);
        setUsername(name);
        setGender(userGender || '');
        console.log("Logged in:", name, userGender);
    };

    const logout = () => {
        setIsLoggingOut(true); // Bắt đầu loading
        setTimeout(() => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            localStorage.removeItem('gender');
            setIsLoggedIn(false);
            setUsername('');
            setGender('');
            setIsLoggingOut(false); // Kết thúc loading
            console.log("Logged out");
        }, 700);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, username, gender, login, logout, isLoggingOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);