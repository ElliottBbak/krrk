import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export const useActiveChallenges = (groupId: string) =>
  useQuery<any>({
    queryKey: ['challenges', groupId, 'active'],
    queryFn: () =>
      api.get(`/groups/${groupId}/challenges?status=ACTIVE`) as Promise<any>,
    enabled: !!groupId,
  });

export const useCreateChallenge = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      api.post(`/groups/${groupId}/challenges`, data) as Promise<any>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['challenges', groupId] });
    },
  });
};
