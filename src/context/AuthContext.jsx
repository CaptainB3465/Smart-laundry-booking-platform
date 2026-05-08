import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for mocked session
    const storedUser = localStorage.getItem('laundry_mock_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const user = await loginUser(email, password);
    setCurrentUser(user);
    localStorage.setItem('laundry_mock_user', JSON.stringify(user));
    return user;
  };

  const register = async (email, password, displayName) => {
    const user = await registerUser(email, password, displayName);
    setCurrentUser(user);
    localStorage.setItem('laundry_mock_user', JSON.stringify(user));
    return user;
  };

  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
    localStorage.removeItem('laundry_mock_user');
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAdmin: currentUser?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
