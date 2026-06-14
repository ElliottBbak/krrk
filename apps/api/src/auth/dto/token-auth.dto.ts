import { IsString } from 'class-validator';

export class TokenAuthDto {
  @IsString()
  personalToken: string;
}
