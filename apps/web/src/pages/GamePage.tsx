import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroupHome } from '../hooks/useGroup';
import { useAuthStore } from '../stores/authStore';
import { getSocket, connectSocket } from '../socket/index';
import MarbleRace from '../game/MarbleRace';
import type { FinishRanking, KrrkPlayer } from '../game/KrrkRoulette';

type GameState = 'waiting' | 'playing' | 'done';

interface GameResult {
  rankings: FinishRanking[];
  loserId: string;
  winnerId: string;
}

export default function GamePage() {
  const { groupId, challengeId } = useParams<{ groupId: string; challengeId: string }>();
  const navigate = useNavigate();
  const { data: group } = useGroupHome(groupId ?? '');
  const { userId, accessToken } = useAuthStore();

  console.log('[GamePage] render', { groupId, challengeId, accessToken: !!accessToken });

  const [gameState, setGameState] = useState<GameState>('waiting');
  const [players, setPlayers] = useState<KrrkPlayer[]>([]);
  const [seed, setSeed] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [result, setResult] = useState<GameResult | null>(null);
  const resultReported = useRef(false);
  const isHost = useRef(false);

  useEffect(() => {
    if (!groupId || !challengeId || !accessToken) return;

    const socket = getSocket();

    socket.auth = { token: accessToken };

    const joinRoom = () => {
      console.log('[socket] emit join_room', { groupId, challengeId, socketId: socket.id });
      socket.emit('join_room', { groupId, challengeId });
    };

    socket.on('connect', () => console.log('[socket] connected', socket.id));
    socket.on('disconnect', (reason) => console.log('[socket] disconnected', reason));
    socket.on('connect_error', (err) => console.log('[socket] connect_error', err.message));

    if (socket.connected) {
      joinRoom();
    } else {
      socket.once('connect', joinRoom);
      connectSocket();
    }

    socket.on('room_joined', ({ players: p }: { players: KrrkPlayer[] }) => {
      console.log('[socket] room_joined, players:', p.length);
      setPlayers(p);
    });

    socket.on('game_started', ({ sessionId: sid, seed: s, players: p, isHost: host }: {
      sessionId: string;
      seed: string;
      players: KrrkPlayer[];
      isHost: boolean;
    }) => {
      console.log('[socket] game_started received', { sid, seed: s, players: p?.length, isHost: host });
      isHost.current = host;
      setSessionId(sid);
      setSeed(s);
      setPlayers(p);
      setGameState('playing');
    });
    socket.on('game_result', (data: GameResult) => {
      setResult(data);
      setGameState('done');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('connect', joinRoom);
      socket.off('room_joined');
      socket.off('game_started');
      socket.off('game_result');
    };
  }, [groupId, challengeId, accessToken]);

  const handleStartGame = () => {
    const socket = getSocket();
    socket.emit('start_game', { groupId, challengeId });
  };

  const handleFinish = (rankings: FinishRanking[]) => {
    if (!isHost.current || resultReported.current) return;
    resultReported.current = true;

    const socket = getSocket();
    socket.emit('game_finished', { sessionId, rankings });
  };

  const loser = result ? players.find((p) => p.id === result.loserId) : null;
  const winner = result ? players.find((p) => p.id === result.winnerId) : null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#111' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: '#222', color: 'white' }}>
        <button onClick={() => navigate(`/group/${groupId}`)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>
          ← 뒤로
        </button>
        <span style={{ fontWeight: 'bold' }}>{group?.name}</span>
        <span style={{ marginLeft: 'auto', color: '#888', fontSize: 13 }}>
          {players.length}명 참여
        </span>
      </div>

      {/* 게임 영역 */}
      <div style={{ flex: 1, position: 'relative' }}>
        {gameState === 'waiting' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', color: 'white', gap: 24 }}>
            <h2>참가자 {players.length}명 대기 중</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {players.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#333', borderRadius: 8 }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                  <span>{p.name}</span>
                  {p.id === userId && <span style={{ color: '#888', fontSize: 12 }}>(나)</span>}
                </div>
              ))}
            </div>
            {players.length >= 2 && (
              <button
                onClick={handleStartGame}
                style={{ padding: '16px 40px', fontSize: 20, fontWeight: 'bold', background: '#ff4444', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer' }}
              >
                게임 시작!
              </button>
            )}
            {players.length < 2 && (
              <p style={{ color: '#888' }}>최소 2명이 필요합니다</p>
            )}
          </div>
        )}

        {gameState === 'playing' && seed && players.length > 0 && (
          <>
            <div style={{ position: 'absolute', top: 4, right: 4, zIndex: 99, color: '#555', fontSize: 10 }}>
              seed: {seed.slice(0, 8)}
            </div>
            <MarbleRace
              players={players}
              seed={seed}
              onFinish={handleFinish}
            />
          </>
        )}

        {gameState === 'done' && result && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', color: 'white', gap: 20 }}>
            <h2>결과 발표</h2>

            {loser && (
              <div style={{ textAlign: 'center', padding: 24, background: '#2a0000', borderRadius: 16, border: '2px solid #ff4444' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: loser.color, margin: '0 auto 12px' }} />
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#ff4444' }}>독박!</div>
                <div style={{ fontSize: 24, marginTop: 4 }}>{loser.name}</div>
              </div>
            )}

            <div style={{ width: '100%', maxWidth: 400, padding: '0 20px' }}>
              <h3>전체 순위</h3>
              {result.rankings.map((r) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #333' }}>
                  <span style={{ color: '#888', width: 24 }}>#{r.rank}</span>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: r.color, display: 'inline-block' }} />
                  <span>{r.name}</span>
                  {r.id === result.loserId && <span style={{ marginLeft: 'auto', color: '#ff4444', fontSize: 12 }}>독박</span>}
                  {r.id === result.winnerId && <span style={{ marginLeft: 'auto', color: '#44ff44', fontSize: 12 }}>1등</span>}
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate(`/group/${groupId}`)}
              style={{ padding: '12px 32px', background: '#444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            >
              그룹 홈으로
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
