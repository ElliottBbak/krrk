import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  userId: string | null;
  accessToken: string | null;
  personalToken: string | null;
  personalLink: string | null;
  setAuth: (data: {
    userId: string;
    accessToken: string;
    personalToken: string;
    personalLink: string;
  }) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userId: null,
      accessToken: null,
      personalToken: null,
      personalLink: null,

      setAuth: (data) => {
        localStorage.setItem('accessToken', data.accessToken);
        set(data);
      },

      clearAuth: () => {
        localStorage.removeItem('accessToken');
        set({ userId: null, accessToken: null, personalToken: null, personalLink: null });
      },

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'krrk-auth',
      partialize: (state) => ({
        userId: state.userId,
        accessToken: state.accessToken,
        personalToken: state.personalToken,
        personalLink: state.personalLink,
      }),
    },
  ),
);
