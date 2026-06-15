import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './group.entity';
import { GroupMember } from './group-member.entity';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { InviteLinksModule } from '../invite-links/invite-links.module';
import { UsersModule } from '../users/users.module';
import { ChallengesModule } from '../challenges/challenges.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, GroupMember]),
    InviteLinksModule,
    UsersModule,
    ChallengesModule,
    AuthModule,
  ],
  providers: [GroupsService],
  controllers: [GroupsController],
  exports: [GroupsService, TypeOrmModule],
})
export class GroupsModule {}
