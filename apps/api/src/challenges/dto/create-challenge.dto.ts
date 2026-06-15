import { IsEnum, IsString, MaxLength } from 'class-validator';
import {
  ChallengeDuration,
  ChallengeType,
  GameType,
  RevealMode,
} from '@krrk/shared';

export class CreateChallengeDto {
  @IsEnum(ChallengeDuration)
  duration: ChallengeDuration;

  @IsEnum(ChallengeType)
  type: ChallengeType;

  @IsEnum(GameType)
  gameType: GameType;

  @IsString()
  @MaxLength(200)
  rewardText: string;

  @IsEnum(RevealMode)
  revealMode: RevealMode;
}
