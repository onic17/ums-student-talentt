import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginAPI, registerAPI, getCurrentUserAPI, UserProfile } from '../utils/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      loadUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (authToken: string) => {
    try {
      const userData = await getCurrentUserAPI(authToken);
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await loginAPI(email, password);
    setToken(response.token);
    localStorage.setItem('token', response.token);
    // Fetch fresh profile so we also get skills/experience
    await loadUser(response.token);
  };

  const register = async (userData: any) => {
    const response = await registerAPI(userData);
    setToken(response.token);
    localStorage.setItem('token', response.token);
    await loadUser(response.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const refreshUser = async () => {
    if (!token) return;
    const data = await getCurrentUserAPI(token);
    setUser(data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        loading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
