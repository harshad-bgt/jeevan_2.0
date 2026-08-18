import React, { createContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Firebase User
  const [applicationProfile, setApplicationProfile] = useState(null); // MongoDB Profile
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await refreshProfile();
      } else {
        setApplicationProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data && res.data.success) {
        setApplicationProfile(res.data.user);
      }
    } catch (err) {
      console.error('[Load Profile Error]', err.response?.data?.message || err.message);
      setApplicationProfile(null);
    }
  };

  const register = async (email, password, additionalData) => {
    setError(null);
    try {
      let token;
      
      // If user is already authenticated (e.g. via Google), just use their existing auth
      if (user) {
        token = await user.getIdToken(true);
        additionalData.firebaseUid = user.uid;
      } else {
        // Otherwise create new Firebase user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        token = await firebaseUser.getIdToken(true);
        additionalData.firebaseUid = firebaseUser.uid;
      }

      const res = await api.post('/auth/register', additionalData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data && res.data.success) {
        await refreshProfile(); // fetch the newly created profile
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid credentials';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (err) {
      const msg = err.message || 'Google Auth failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await api.put('/users/profile', profileData);
      if (res.data && res.data.success) {
        setApplicationProfile(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Profile update failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const submitHealthCheckup = async (checkupData) => {
    setError(null);
    try {
      const res = await api.post('/users/health-checkup', checkupData);
      if (res.data && res.data.success) {
        setApplicationProfile(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Health checkup update failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const toggleAvailability = async () => {
    try {
      const res = await api.patch('/donors/availability');
      if (res.data && res.data.success) {
        setApplicationProfile((prev) => ({
          ...prev,
          isAvailable: res.data.isAvailable
        }));
        return { success: true };
      }
    } catch (err) {
      console.error('Toggle availability failed:', err);
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setApplicationProfile(null);
      setError(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        applicationProfile,
        loading,
        error,
        register,
        login,
        loginWithGoogle,
        updateProfile,
        submitHealthCheckup,
        toggleAvailability,
        refreshProfile,
        logout,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
