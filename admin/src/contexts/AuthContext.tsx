import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken, removeToken } from "@/utils/storage";

interface User {
  _id: string;
  username?: string;
  email: string;
  avatar_url?: string;
  role: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const USER_STORAGE_KEY = "auth_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    // Load user from localStorage on init
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check if token exists on init
    return !!getToken();
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has a token
    const token = getToken();
    if (token) {
      // Token exists, consider user authenticated
      setIsAuthenticated(true);
      setIsLoading(false);
    } else {
      setUserState(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser && typeof window !== "undefined") {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      // Check token after storing user
      const token = getToken();
      setIsAuthenticated(!!token);
    } else if (typeof window !== "undefined") {
      localStorage.removeItem(USER_STORAGE_KEY);
      setIsAuthenticated(false);
    }
  };

  const logout = () => {
    removeToken();
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    setUserState(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
