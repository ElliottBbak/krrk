import { useEffect, useRef, useState } from 'react';
import type { FinishRanking, KrrkPlayer } from './KrrkRoulette';

interface Props {
  players: KrrkPlayer[];
  seed: string;
  onFinish?: (rankings: FinishRanking[]) => void;
}

export default function MarbleRace({ players, seed, onFinish }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<import('./KrrkRoulette').KrrkRoulette | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let game: import('./KrrkRoulette').KrrkRoulette;
    let cancelled = false;

    import('./KrrkRoulette').then(({ KrrkRoulette }) => {
      if (cancelled || !containerRef.current) return;

      game = new KrrkRoulette(containerRef.current);
      gameRef.current = game;

      const checkReady = setInterval(() => {
        if (game.isReady) {
          clearInterval(checkReady);
          game.startWithSeed(players, seed);
          game.start();
          setIsReady(true);
        }
      }, 100);

      game.addEventListener('finish', (e: Event) => {
        const { rankings } = (e as CustomEvent<{ rankings: FinishRanking[] }>).detail;
        onFinish?.(rankings);
      });
    });

    return () => {
      cancelled = true;
      // game engine doesn't have a destroy method, canvas is removed by React
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      />
      {!isReady && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#111',
            color: 'white',
            fontSize: 18,
          }}
        >
          로딩 중...
        </div>
      )}
    </div>
  );
}
