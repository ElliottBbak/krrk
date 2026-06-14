import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/axios';
import { useAuthStore } from '../stores/authStore';

export default function LandingPage() {
  const [groupName, setGroupName] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const userId = useAuthStore((s) => s.userId);

  const createGroup = useMutation({
    mutationFn: async () => {
      // 인증 안 된 경우 게스트 임시 닉네임으로 먼저 가입
      if (!userId) {
        const auth: any = await api.post('/auth/guest', { nickname: '그룹장' });
        setAuth(auth);
      }
      return api.post('/groups', { name: groupName });
    },
    onSuccess: (data: any) => navigate(`/group/${data.id}`),
  });

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: '0 auto' }}>
      <h1>KRRK</h1>
      <p>우리 지금 게임 중임.</p>

      <div style={{ marginTop: 40 }}>
        <h2>그룹 만들기</h2>
        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="그룹 이름"
          style={{ display: 'block', width: '100%', padding: 8, marginBottom: 8 }}
        />
        <button
          onClick={() => createGroup.mutate()}
          disabled={!groupName || createGroup.isPending}
        >
          {createGroup.isPending ? '생성 중...' : '그룹 생성'}
        </button>
      </div>
    </div>
  );
}
