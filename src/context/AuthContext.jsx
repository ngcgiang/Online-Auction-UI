import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");

        if (accessToken && storedUser) {
          // First, restore user from localStorage
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          
          // Then, refresh token in background to ensure it's valid
          if (refreshToken) {
            try {
              const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
              const response = await axios.post(`${apiBaseUrl}/api/auth/refresh-token`, { 
                refreshToken 
              });
              
              if (response.data?.success && response.data?.data?.accessToken) {
                localStorage.setItem("access_token", response.data.data.accessToken);
                console.log("Token refreshed successfully on app load");
              } else {
                throw new Error("Invalid refresh response");
              }
            } catch (error) {
              // If refresh fails, log warning but keep user logged in
              // The axios interceptor will handle 401 errors during API calls
              console.warn("Token refresh failed on app load:", error.message);
              // Don't clear auth here - let API interceptor handle it
            }
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    try {
      // Store tokens and user data
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to save auth data:", error);
    }
  };

  const logout = () => {
    try {
      // Clear all auth data
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Failed to clear auth data:", error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
