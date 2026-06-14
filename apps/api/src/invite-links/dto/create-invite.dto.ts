import { IsEnum, IsIn, IsOptional, IsArray, IsString } from 'class-validator';
import { InviteType } from '@krrk/shared';

export class CreateInviteDto {
  @IsEnum(InviteType)
  type: InviteType;

  @IsIn(['24h', '7d'])
  expiresIn: '24h' | '7d';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  members?: string[];
}
