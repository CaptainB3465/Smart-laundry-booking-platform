import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import auth from '../auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for real-time Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Set the display name on the new Firebase user
    await firebaseUpdateProfile(userCredential.user, {
      displayName: displayName
    });
    return userCredential.user;
  };

  const logout = () => {
    return signOut(auth);
  };

  const updateProfile = async (data) => {
    if (!auth.currentUser) return;
    await firebaseUpdateProfile(auth.currentUser, data);
    // Firebase doesn't automatically trigger onAuthStateChanged for profile updates, 
    // so we force a state refresh by spreading the current user
    setCurrentUser({ ...auth.currentUser });
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    updateProfile,
    // Identify Admin by environment variable email
    isAdmin: currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
