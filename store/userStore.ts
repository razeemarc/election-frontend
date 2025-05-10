import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isBlocked: boolean;
}

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (userData: User, token: string) => {
        // Store token in cookie (7 days expiry by default)
        Cookies.set('auth_token', token, { expires: 7, sameSite: 'Lax' });
        
        set({
          user: userData,
          token,
          isAuthenticated: true,
        });
      },
      logout: () => {
        // Remove token from cookies
        Cookies.remove('auth_token');
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'user-storage',
      // Don't persist token in localStorage for security
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);