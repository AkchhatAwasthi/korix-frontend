import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loginState: (user: any) => void;
  logoutState: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Verify user exists and token is valid (this handles refresh implicitly if needed later)
          const { user } = await authService.profile();
          setUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is dead or refresh failed
          localStorage.removeItem('access_token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const loginState = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logoutState = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout API failed', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('access_token');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loginState, logoutState, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
