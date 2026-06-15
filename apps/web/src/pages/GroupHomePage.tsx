import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGroupHome, useCreateInvite } from '../hooks/useGroup';
import { useCreateChallenge } from '../hooks/useChallenge';

const GAME_TYPE_LABEL: Record<string, string> = {
  MARBLE_RACE: '구슬 레이스',
  BOMB: '폭탄',
  TIMER: '타이머',
};

const DURATION_LABEL: Record<string, string> = {
  SINGLE: '단판',
  WEEK: '1주',
  MONTH: '1달',
};

const REVEAL_MODE_LABEL: Record<string, string> = {
  REALTIME: '실시간',
  ON_END: '종료 후 공개',
};

type ChallengeForm = {
  rewardText: string;
  gameType: string;
  duration: string;
  type: string;
  revealMode: string;
};

const DEFAULT_FORM: ChallengeForm = {
  rewardText: '',
  gameType: 'MARBLE_RACE',
  duration: 'SINGLE',
  type: 'LOSER_PENALTY',
  revealMode: 'REALTIME',
};

export default function GroupHomePage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { data: group, isLoading } = useGroupHome(groupId ?? '');

  const [inviteUrl, setInviteUrl] = useState('');
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [form, setForm] = useState<ChallengeForm>(DEFAULT_FORM);
  const [copied, setCopied] = useState(false);

  const createInvite = useCreateInvite(groupId ?? '');
  const createChallenge = useCreateChallenge(groupId ?? '');

  if (isLoading) return <div style={{ padding: 40 }}>로딩 중...</div>;
  if (!group) return <div style={{ padding: 40 }}>그룹을 찾을 수 없습니다.</div>;

  const handleCreateInvite = async () => {
    const result: any = await createInvite.mutateAsync({
      type: 'SHARED',
      expiresIn: '24h',
    });
    setInviteUrl(result.url);
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateChallenge = async () => {
    if (!form.rewardText.trim()) return;
    await createChallenge.mutateAsync(form);
    setForm(DEFAULT_FORM);
    setShowChallengeForm(false);
  };

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
      <h1>{group.name}</h1>
      <p style={{ color: '#888' }}>멤버 {group.members?.length ?? 0}명</p>

      {/* 초대링크 */}
      <section style={{ marginTop: 24, padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
        <h2 style={{ margin: '0 0 12px' }}>초대링크</h2>
        {inviteUrl ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              readOnly
              value={inviteUrl}
              style={{ flex: 1, padding: 8, fontSize: 13 }}
            />
            <button onClick={handleCopyInvite}>
              {copied ? '복사됨!' : '복사'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleCreateInvite}
            disabled={createInvite.isPending}
          >
            {createInvite.isPending ? '생성 중...' : '초대링크 생성 (24시간)'}
          </button>
        )}
      </section>

      {/* 멤버 */}
      <section style={{ marginTop: 24 }}>
        <h2>멤버</h2>
        {group.members?.map((m: any) => (
          <div
            key={m.userId}
            style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: m.avatarColor,
                marginRight: 10,
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1 }}>{m.displayName}</span>
            <span style={{ color: '#888', fontSize: 13 }}>
              {m.totalWins}승 {m.totalLosses}패
            </span>
          </div>
        ))}
      </section>

      {/* 활성 챌린지 */}
      <section style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>챌린지</h2>
          <button onClick={() => setShowChallengeForm((v) => !v)}>
            {showChallengeForm ? '취소' : '+ 챌린지 제안'}
          </button>
        </div>

        {/* 챌린지 생성 폼 */}
        {showChallengeForm && (
          <div style={{ padding: 16, background: '#f0f0f0', borderRadius: 8, marginBottom: 16 }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>벌칙/베네핏 내용</label>
              <input
                value={form.rewardText}
                onChange={(e) => setForm((f) => ({ ...f, rewardText: e.target.value }))}
                placeholder="예: 오늘 술값 내기"
                style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                maxLength={200}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>게임</label>
                <select
                  value={form.gameType}
                  onChange={(e) => setForm((f) => ({ ...f, gameType: e.target.value }))}
                  style={{ width: '100%', padding: 8 }}
                >
                  <option value="MARBLE_RACE">구슬 레이스</option>
                  <option value="BOMB">폭탄</option>
                  <option value="TIMER">타이머</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>기간</label>
                <select
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  style={{ width: '100%', padding: 8 }}
                >
                  <option value="SINGLE">단판</option>
                  <option value="WEEK">1주</option>
                  <option value="MONTH">1달</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>챌린지 종류</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  style={{ width: '100%', padding: 8 }}
                >
                  <option value="LOSER_PENALTY">꼴찌 벌칙</option>
                  <option value="WINNER_BENEFIT">1등 베네핏</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>순위 공개</label>
                <select
                  value={form.revealMode}
                  onChange={(e) => setForm((f) => ({ ...f, revealMode: e.target.value }))}
                  style={{ width: '100%', padding: 8 }}
                >
                  <option value="REALTIME">실시간</option>
                  <option value="ON_END">종료 후 공개</option>
                </select>
              </div>
            </div>

            {createChallenge.isError && (
              <p style={{ color: 'red', fontSize: 13 }}>
                {(createChallenge.error as any)?.message ?? '오류가 발생했습니다.'}
              </p>
            )}

            <button
              onClick={handleCreateChallenge}
              disabled={!form.rewardText.trim() || createChallenge.isPending}
              style={{ width: '100%', padding: 10 }}
            >
              {createChallenge.isPending ? '생성 중...' : '챌린지 시작'}
            </button>
          </div>
        )}

        {/* 활성 챌린지 목록 */}
        {group.activeChallenges?.length > 0 ? (
          group.activeChallenges.map((c: any) => (
            <div
              key={c.id}
              style={{
                padding: 16,
                border: '1px solid #ddd',
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: 12,
                      padding: '2px 8px',
                      background: '#e8f0fe',
                      borderRadius: 4,
                      marginBottom: 6,
                    }}
                  >
                    {GAME_TYPE_LABEL[c.gameType] ?? c.gameType}
                  </span>
                  <p style={{ margin: '4px 0', fontWeight: 600 }}>{c.rewardText}</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
                    {DURATION_LABEL[c.duration]} · {REVEAL_MODE_LABEL[c.revealMode]}
                  </p>
                </div>
                <button style={{ padding: '6px 14px' }} disabled>
                  게임 시작
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#888' }}>진행 중인 챌린지가 없습니다.</p>
        )}
      </section>
    </div>
  );
}
