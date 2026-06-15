import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/axios';
import { useAuthStore } from '../stores/authStore';

export default function LandingPage() {
  const [nickname, setNickname] = useState('');
  const [groupName, setGroupName] = useState('');
  const navigate = useNavigate();
  const { setAuth, userId } = useAuthStore();

  const createGroup = useMutation({
    mutationFn: async () => {
      if (!userId) {
        const auth: any = await api.post('/auth/guest', {
          nickname: nickname.trim(),
        });
        setAuth(auth);
      }
      return api.post('/groups', { name: groupName.trim() }) as Promise<any>;
    },
    onSuccess: (data: any) => navigate(`/group/${data.id}`),
  });

  const canSubmit =
    (userId || nickname.trim()) && groupName.trim() && !createGroup.isPending;

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: '0 auto' }}>
      <h1>KRRK</h1>
      <p>우리 지금 게임 중임.</p>

      <div style={{ marginTop: 40 }}>
        <h2>그룹 만들기</h2>

        {!userId && (
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            style={{ display: 'block', width: '100%', padding: 8, marginBottom: 8, boxSizing: 'border-box' }}
          />
        )}

        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="그룹 이름"
          onKeyDown={(e) => e.key === 'Enter' && canSubmit && createGroup.mutate()}
          style={{ display: 'block', width: '100%', padding: 8, marginBottom: 8, boxSizing: 'border-box' }}
        />

        <button
          onClick={() => createGroup.mutate()}
          disabled={!canSubmit}
          style={{ width: '100%', padding: 10 }}
        >
          {createGroup.isPending ? '생성 중...' : '그룹 생성'}
        </button>

        {createGroup.isError && (
          <p style={{ color: 'red', marginTop: 8 }}>
            {(createGroup.error as any)?.message ?? '오류가 발생했습니다.'}
          </p>
        )}
      </div>
    </div>
  );
}
