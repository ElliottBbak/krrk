# @krrk/api

KRRK 백엔드. NestJS + TypeScript + PostgreSQL.

## 기술 스택

| 역할 | 라이브러리 |
|---|---|
| 프레임워크 | NestJS 11 |
| DB ORM | TypeORM + PostgreSQL |
| 실시간 | Socket.IO (NestJS Gateway) |
| 인증 | JWT (@nestjs/jwt) |
| 스케줄러 | @nestjs/schedule (Cron Jobs) |

## 모듈 구조

```
src/
├── auth/           # 게스트 입장, 개인토큰 재입장, 소셜 로그인, JWT 발급
├── users/          # User 엔티티 + 토큰 기반 유저 재식별
├── groups/         # 그룹 생성/조회, 초대링크(A/B), 휴면 Cron
├── challenges/     # 챌린지 제안·진행·종료, 히든랭킹, 시즌 공개 Cron
├── games/          # GameSession 생성, 게임별 로직 (Marble/Bomb/Timer)
├── gateway/        # Socket.IO Gateway, 룸 관리, 게임 브로드캐스트
├── seasons/        # SeasonSummary 생성, 결과 카드
└── common/         # JwtAuthGuard, GroupMemberGuard, ResponseInterceptor
```

## Cron Jobs

| Job | 주기 | 동작 |
|---|---|---|
| cleanExpiredInvites | 매일 새벽 2시 | 만료 초대링크 삭제 |
| checkDormantGroups | 매일 새벽 1시 | 3개월 비활성 그룹 → DORMANT |
| processAbsentPlayers | 매일 자정 | 당일 미참여 멤버 자동 패배 |
| revealExpiredChallenges | 매시간 | 기간 종료 챌린지 → REVEALED |

## 실행

루트에서 실행 권장:
```bash
# 루트에서
pnpm dev

# 이 앱만
pnpm --filter @krrk/api dev
```

## 환경 변수

```bash
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/krrk
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=30d
```
