import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupStatus } from '@krrk/shared';
import { Group } from './group.entity';
import { GroupMember } from './group-member.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { InviteLinksService } from '../invite-links/invite-links.service';
import { CreateInviteDto } from '../invite-links/dto/create-invite.dto';
import { InviteType } from '@krrk/shared';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepo: Repository<GroupMember>,
    private readonly inviteLinksService: InviteLinksService,
  ) {}

  async create(userId: string, nickname: string, dto: CreateGroupDto) {
    const group = this.groupRepo.create({ name: dto.name });
    await this.groupRepo.save(group);

    const member = this.groupMemberRepo.create({
      groupId: group.id,
      userId,
      displayName: nickname,
      joinedAt: new Date(),
    });
    await this.groupMemberRepo.save(member);

    return {
      id: group.id,
      name: group.name,
      status: group.status,
      createdAt: group.createdAt,
    };
  }

  async getHome(groupId: string) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['members', 'members.user'],
    });
    if (!group) throw new NotFoundException('그룹을 찾을 수 없습니다.');

    return {
      id: group.id,
      name: group.name,
      status: group.status,
      lastGameAt: group.lastGameAt,
      members: group.members.map((m) => ({
        userId: m.userId,
        displayName: m.displayName,
        totalWins: m.totalWins,
        totalLosses: m.totalLosses,
        avatarColor: m.user.avatarColor,
      })),
      activeChallenges: [],
    };
  }

  async getMyGroups(userId: string) {
    const memberships = await this.groupMemberRepo.find({
      where: { userId },
      relations: ['group'],
    });

    const active = memberships
      .filter((m) => m.group.status === GroupStatus.ACTIVE)
      .map((m) => ({
        id: m.group.id,
        name: m.group.name,
        status: m.group.status,
        lastGameAt: m.group.lastGameAt,
      }));

    const dormant = memberships
      .filter((m) => m.group.status === GroupStatus.DORMANT)
      .map((m) => ({
        id: m.group.id,
        name: m.group.name,
        status: m.group.status,
        lastGameAt: m.group.lastGameAt,
      }));

    return { active, dormant };
  }

  async restore(groupId: string, userId: string) {
    const member = await this.groupMemberRepo.findOne({
      where: { groupId, userId },
    });
    if (!member) throw new ForbiddenException('그룹 멤버가 아닙니다.');

    await this.groupRepo.update(groupId, {
      status: GroupStatus.ACTIVE,
      dormantAt: undefined,
    });

    return { id: groupId, status: GroupStatus.ACTIVE };
  }

  async createInvite(groupId: string, userId: string, dto: CreateInviteDto) {
    const member = await this.groupMemberRepo.findOne({
      where: { groupId, userId },
    });
    if (!member) throw new ForbiddenException('그룹 멤버가 아닙니다.');

    return this.inviteLinksService.create(groupId, dto);
  }
}
