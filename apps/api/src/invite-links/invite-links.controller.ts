import { Controller, Get, Param } from '@nestjs/common';
import { InviteLinksService } from './invite-links.service';

@Controller('invites')
export class InviteLinksController {
  constructor(private readonly inviteLinksService: InviteLinksService) {}

  @Get(':token')
  getInfo(@Param('token') token: string) {
    return this.inviteLinksService.getInfo(token);
  }
}
