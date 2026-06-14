import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class GuestAuthDto {
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  nickname: string;

  @IsOptional()
  @IsString()
  inviteToken?: string;
}
