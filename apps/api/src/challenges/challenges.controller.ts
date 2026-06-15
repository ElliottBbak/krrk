import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { ChallengeStatus } from '@krrk/shared';

@Controller('groups/:groupId/challenges')
@UseGuards(JwtAuthGuard)
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post()
  create(
    @Param('groupId') groupId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateChallengeDto,
  ) {
    return this.challengesService.create(groupId, user.userId, dto);
  }

  @Get()
  findByGroup(
    @Param('groupId') groupId: string,
    @Query('status') status?: ChallengeStatus,
  ) {
    return this.challengesService.findByGroup(groupId, status);
  }
}
