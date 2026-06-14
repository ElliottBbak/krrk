import { useParams } from 'react-router-dom';
import { useGroupHome } from '../hooks/useGroup';

export default function GroupHomePage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { data: group, isLoading } = useGroupHome(groupId ?? '');

  if (isLoading) return <div>로딩 중...</div>;
  if (!group) return <div>그룹을 찾을 수 없습니다.</div>;

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
      <h1>{group.name}</h1>
      <p>멤버 {group.members?.length ?? 0}명</p>

      <section style={{ marginTop: 24 }}>
        <h2>멤버</h2>
        {group.members?.map((m: any) => (
          <div key={m.userId} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: m.avatarColor,
                marginRight: 8,
              }}
            />
            {m.displayName} · {m.totalWins}승 {m.totalLosses}패
          </div>
        ))}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>활성 챌린지</h2>
        <p style={{ color: '#888' }}>진행 중인 챌린지가 없습니다.</p>
      </section>
    </div>
  );
}
