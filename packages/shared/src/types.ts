import {
  ChallengeDuration,
  ChallengeStatus,
  ChallengeType,
  GameType,
  GroupStatus,
  InviteType,
  RevealMode,
  UserType,
} from './enums';

// --- Auth ---
export interface GuestAuthDto {
  nickname: string;
  inviteToken?: string;
}

export interface TokenAuthDto {
  personalToken: string;
}

export interface AuthResponse {
  userId: string;
  accessToken: string;
  personalToken: string;
  personalLink: string;
}

// --- User ---
export interface UserDto {
  id: string;
  nickname: string;
  type: UserType;
  avatarColor: string;
}

// --- Group ---
export interface GroupDto {
  id: string;
  name: string;
  status: GroupStatus;
  lastGameAt?: string;
}

export interface GroupHomeDto extends GroupDto {
  members: GroupMemberDto[];
  activeChallenges: ChallengeDto[];
}

export interface GroupMemberDto {
  userId: string;
  displayName: string;
  totalWins: number;
  totalLosses: number;
  avatarColor: string;
}

// --- Invite ---
export interface CreateInviteDto {
  type: InviteType;
  expiresIn: '24h' | '7d';
  members?: string[];
}

export interface InviteInfoDto {
  groupId: string;
  groupName: string;
  type: InviteType;
  targetName?: string;
  isExpired: boolean;
  memberCount: number;
}

// --- Challenge ---
export interface CreateChallengeDto {
  duration: ChallengeDuration;
  type: ChallengeType;
  gameType: GameType;
  rewardText: string;
  revealMode: RevealMode;
}

export interface ChallengeDto {
  id: string;
  groupId: string;
  duration: ChallengeDuration;
  type: ChallengeType;
  gameType: GameType;
  rewardText: string;
  revealMode: RevealMode;
  status: ChallengeStatus;
  startsAt: string;
  endsAt?: string;
}

export interface MyStatusDto {
  status: 'SAFE' | 'DANGER' | 'CRITICAL';
  gamesPlayed: number;
  gamesTotal: number;
}

// --- Game ---
export interface GameSessionDto {
  sessionId: string;
  roomCode: string;
  gameType: GameType;
  status: 'WAITING' | 'PLAYING' | 'DONE';
  players: PlayerDto[];
}

export interface PlayerDto {
  userId: string;
  nickname: string;
  avatarColor: string;
}

export interface GameResultDto {
  userId: string;
  rank: number;
  score?: number;
  isWinner: boolean;
  isLoser: boolean;
  didParticipate: boolean;
}

// --- Socket Events ---
export interface GameStartPayload {
  sessionId: string;
  gameType: GameType;
  players: PlayerDto[];
  seed?: string;
  playerOrder?: string[];
}

export interface GameStatePayload {
  sessionId: string;
  // 구슬 레이스
  marbles?: { userId: string; x: number; y: number; rank: number }[];
  // 폭탄 게임
  bombHolder?: string;
  warningMode?: boolean;
  // 타이머 게임
  currentTurn?: string;
  turnIndex?: number;
}

export interface GameEndPayload {
  sessionId: string;
  rankings: { rank: number; userId: string; nickname: string; score?: number }[];
  loserId: string;
  winnerId: string;
  rewardText: string;
}

export interface TimerResultPayload {
  sessionId: string;
  userId: string;
  stopIndex: 1 | 2;
  value: number;
  lastDigit: number;
  score?: number;
}

export interface SeasonRevealPayload {
  challengeId: string;
  rankings: { rank: number; userId: string; nickname: string; wins: number; losses: number }[];
  mvpUserId: string;
  mvpNickname: string;
  rewardText: string;
  cardImageUrl?: string;
}
