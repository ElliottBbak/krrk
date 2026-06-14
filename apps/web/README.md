# @krrk/web

KRRK 프론트엔드. React + Vite + TypeScript.

## 기술 스택

| 역할 | 라이브러리 |
|---|---|
| UI | React 19 + TypeScript |
| 번들러 | Vite |
| 라우팅 | React Router v7 |
| 실시간 상태 | Zustand |
| 서버 데이터 | TanStack Query v5 |
| 소켓 | Socket.IO Client |
| 게임 물리 | Matter.js + seedrandom |
| 이미지 생성 | html-to-image |

## 디렉토리 구조

```
src/
├── pages/          # 라우트별 페이지 컴포넌트
├── components/     # 공통 UI 컴포넌트
├── stores/         # Zustand 스토어 (게임 실시간 상태, 인증)
├── hooks/          # TanStack Query 훅 (서버 데이터 패칭)
├── socket/         # Socket.IO 클라이언트 + 이벤트 핸들러
└── games/          # 게임별 엔진 (구슬 레이스: Matter.js)
```

## 실행

루트에서 실행 권장:
```bash
# 루트에서
pnpm dev

# 이 앱만
pnpm --filter @krrk/web dev
```

## 환경 변수

```bash
# .env.local
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```
