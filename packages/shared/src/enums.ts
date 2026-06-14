export enum UserType {
  GUEST = 'GUEST',
  TOKEN = 'TOKEN',
  SOCIAL = 'SOCIAL',
}

export enum SocialProvider {
  KAKAO = 'KAKAO',
  GOOGLE = 'GOOGLE',
}

export enum GroupStatus {
  ACTIVE = 'ACTIVE',
  DORMANT = 'DORMANT',
}

export enum ChallengeDuration {
  SINGLE = 'SINGLE',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

export enum ChallengeType {
  LOSER_PENALTY = 'LOSER_PENALTY',
  WINNER_BENEFIT = 'WINNER_BENEFIT',
}

export enum ChallengeStatus {
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
  REVEALED = 'REVEALED',
  ARCHIVED = 'ARCHIVED',
}

export enum GameType {
  MARBLE_RACE = 'MARBLE_RACE',
  BOMB = 'BOMB',
  TIMER = 'TIMER',
}

export enum RevealMode {
  REALTIME = 'REALTIME',
  ON_END = 'ON_END',
}

export enum InviteType {
  SHARED = 'SHARED',
  PERSONAL = 'PERSONAL',
}
