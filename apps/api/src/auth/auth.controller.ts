import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GuestAuthDto } from './dto/guest-auth.dto';
import { TokenAuthDto } from './dto/token-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('guest')
  guestAuth(@Body() dto: GuestAuthDto) {
    return this.authService.guestAuth(dto);
  }

  @Post('token')
  tokenAuth(@Body() dto: TokenAuthDto) {
    return this.authService.tokenAuth(dto);
  }
}
