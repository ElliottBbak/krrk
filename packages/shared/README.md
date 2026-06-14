# @krrk/shared

`@krrk/web`과 `@krrk/api`가 공통으로 사용하는 타입과 Enum 패키지.

## 포함 항목

- `enums.ts` — UserType, GameType, ChallengeStatus 등 모든 Enum
- `types.ts` — DTO 타입, Socket 이벤트 페이로드 타입

## 사용법

```ts
import { GameType, ChallengeStatus } from '@krrk/shared';
import type { CreateChallengeDto, GameEndPayload } from '@krrk/shared';
```

## 원칙

- 타입과 Enum만 포함. 로직 없음.
- API 응답 타입이 바뀌면 여기만 수정하면 양쪽에 반영됨.
- UI 컴포넌트, 유틸 함수는 포함하지 않음.
