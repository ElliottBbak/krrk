import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteLink } from './invite-link.entity';
import { InviteLinksService } from './invite-links.service';
import { InviteLinksController } from './invite-links.controller';
import { Group } from '../groups/group.entity';
import { GroupMember } from '../groups/group-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InviteLink, Group, GroupMember])],
  providers: [InviteLinksService],
  controllers: [InviteLinksController],
  exports: [InviteLinksService],
})
export class InviteLinksModule {}
