import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameSession } from './game-session.entity';
import { GameResult } from './game-result.entity';
import { GroupMember } from '../groups/group-member.entity';
import { GameSessionsService } from './game-sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([GameSession, GameResult, GroupMember])],
  providers: [GameSessionsService],
  exports: [GameSessionsService],
})
export class GameSessionsModule {}
