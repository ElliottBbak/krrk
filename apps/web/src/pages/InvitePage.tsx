import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInviteInfo } from '../hooks/useGroup';
import { useGuestAuth } from '../hooks/useAuth';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');

  const { data: invite, isLoading, isError } = useInviteInfo(token ?? '');
  const guestAuth = useGuestAuth();

  const handleJoin = async () => {
    await guestAuth.mutateAsync({ nickname, inviteToken: token });
    navigate(`/group/${invite.groupId}`);
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (isError || !invite) return <div>유효하지 않은 초대링크입니다.</div>;
  if (invite.isExpired) return <div>초대링크가 만료됐습니다. 새 링크를 요청해주세요.</div>;

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: '0 auto' }}>
      <h1>KRRK</h1>
      <h2>{invite.groupName}</h2>
      <p>멤버 {invite.memberCount}명이 기다리고 있어요.</p>

      <div style={{ marginTop: 32 }}>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임 입력"
          style={{ display: 'block', width: '100%', padding: 8, marginBottom: 8 }}
        />
        <button
          onClick={handleJoin}
          disabled={!nickname || guestAuth.isPending}
        >
          {guestAuth.isPending ? '입장 중...' : '입장하기'}
        </button>
      </div>
    </div>
  );
}
