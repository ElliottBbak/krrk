# KRRK

> 우리 지금 게임 중임. 니들도 모르는 사이에.

친구 그룹이 모이든 안 모이든 — 항상 게임 중인 상태를 만드는 웹 챌린지 플랫폼.

---

## 서비스 개요

커피값, 술값, 방 배정 — 매번 가위바위보로 끝내던 그 결정들이 KRRK에서는 드라마가 된다.
그리고 그 드라마는 사라지지 않는다. 시즌 기록으로 쌓이고, 독박왕 연대기가 된다.

- **URL 하나로 시작** — 설치 없음. 링크 던지면 브라우저에서 바로.
- **게임 3종** — 구슬 레이스 / 폭탄 게임 / 타이머 게임
- **시즌제** — 단판 / 1주 / 1달. 히든 랭킹. 월말 독박왕 공개.
- **기록이 해자** — 3년치 독박왕 연대기는 다른 앱으로 안 간다.

---

## 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend | React + Vite + TypeScript |
| Backend | NestJS + TypeScript |
| Realtime | Socket.IO |
| Database | PostgreSQL + TypeORM |
| 배포 | AWS EC2 (단일 인스턴스) |
| Monorepo | pnpm workspaces + Turborepo |

---

## 프로젝트 구조

```
krrk/
├── apps/
│   ├── web/          # React 프론트엔드
│   └── api/          # NestJS 백엔드
├── packages/
│   └── shared/       # 공유 타입 + Enum
└── docs/             # 설계 문서
```

---

## 실행

```bash
pnpm install
pnpm dev        # web + api 동시 실행
```

---

## 문서

| 문서 | 설명 |
|---|---|
| [Vision](docs/1_KRRK_Vision.md) | 서비스 비전 |
| [Product Master PRD](docs/2_KRRK_Product_Master_PRD.md) | 제품 요구사항 정의서 |
| [Roadmap](docs/3_KRRK_Roadmap.md) | 개발 로드맵 |
| [Group Lifecycle](docs/4_KRRK_Group_Lifecycle_Bible.md) | 그룹 라이프사이클 |
| [Game Design Bible](docs/5_KRRK_Game_Design_Bible.md) | 게임 설계 문서 |
| [Challenge Lifecycle](docs/6_KRRK_Challenge_Lifecycle_Bible.md) | 챌린지 라이프사이클 |
| [User Flow](docs/krrk_userflow.html) | 유저 플로우 |
| [ERD](docs/krrk_erd.html) | ERD & 데이터베이스 스키마 |
| [API Spec](docs/krrk_api.html) | API 명세 |
| [Infra Architecture](docs/krrk_infra.html) | 인프라 아키텍처 |
| [SW Architecture](docs/krrk_sw_arch.html) | 소프트웨어 아키텍처 |

---

## 개발 로드맵

| Phase | 기간 | 목표 |
|---|---|---|
| Phase 1 | 1개월 | 구슬 레이스 + 단판. 친구들이랑 술자리에서 한 판. |
| Phase 2 | 2개월 | 폭탄 + 타이머 + 개인 토큰 재입장 |
| Phase 3 | 3개월 | 시즌제 + 히든 랭킹 + 독박왕 공개 |
| Phase 4 | 이후 | 결과 카드 공유 + 그룹 히스토리 + 업적 |

---

## 북극성 지표

> 시즌 종료 후 같은 그룹이 다음 챌린지를 시작하는 비율

이 숫자가 올라가면 KRRK는 성공하고 있다.

---

*KRRK — 긁혔다 ㅋㅋ*
