import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export const useGroupHome = (groupId: string) =>
  useQuery<any>({
    queryKey: ['group', groupId],
    queryFn: () => api.get(`/groups/${groupId}`) as Promise<any>,
    enabled: !!groupId,
  });

export const useMyGroups = () =>
  useQuery<any>({
    queryKey: ['my-groups'],
    queryFn: () => api.get('/groups/my') as Promise<any>,
  });

export const useInviteInfo = (token: string) =>
  useQuery<any>({
    queryKey: ['invite', token],
    queryFn: () => api.get(`/invites/${token}`) as Promise<any>,
    enabled: !!token,
  });

export const useCreateInvite = (groupId: string) =>
  useMutation({
    mutationFn: (data: { type: string; expiresIn: '24h' | '7d' }) =>
      api.post(`/groups/${groupId}/invites`, data) as Promise<any>,
  });
