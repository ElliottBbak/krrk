import { useMutation } from '@tanstack/react-query';
import api from '../lib/axios';
import { useAuthStore } from '../stores/authStore';

interface GuestAuthPayload {
  nickname: string;
  inviteToken?: string;
}

interface TokenAuthPayload {
  personalToken: string;
}

export const useGuestAuth = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: GuestAuthPayload) =>
      api.post('/auth/guest', payload),
    onSuccess: (data: any) => setAuth(data),
  });
};

export const useTokenAuth = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: TokenAuthPayload) =>
      api.post('/auth/token', payload),
    onSuccess: (data: any) => setAuth(data),
  });
};
