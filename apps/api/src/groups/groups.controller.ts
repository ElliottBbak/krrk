import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { CreateInviteDto } from '../invite-links/dto/create-invite.dto';
import { UsersService } from '../users/users.service';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateGroupDto,
  ) {
    const userEntity = await this.usersService.findById(user.userId);
    return this.groupsService.create(user.userId, userEntity.nickname, dto);
  }

  @Get('my')
  getMyGroups(@CurrentUser() user: JwtPayload) {
    return this.groupsService.getMyGroups(user.userId);
  }

  @Get(':groupId')
  getHome(@Param('groupId') groupId: string) {
    return this.groupsService.getHome(groupId);
  }

  @Patch(':groupId/restore')
  restore(
    @Param('groupId') groupId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.groupsService.restore(groupId, user.userId);
  }

  @Post(':groupId/invites')
  createInvite(
    @Param('groupId') groupId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateInviteDto,
  ) {
    return this.groupsService.createInvite(groupId, user.userId, dto);
  }
}
