import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InviteType } from '@krrk/shared';
import { InviteLink } from './invite-link.entity';
import { Group } from '../groups/group.entity';
import { GroupMember } from '../groups/group-member.entity';
import { User } from '../users/user.entity';
import { CreateInviteDto } from './dto/create-invite.dto';
import crypto from 'crypto';

@Injectable()
export class InviteLinksService {
  constructor(
    @InjectRepository(InviteLink)
    private readonly inviteLinkRepo: Repository<InviteLink>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepo: Repository<GroupMember>,
  ) {}

  async create(groupId: string, dto: CreateInviteDto) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('그룹을 찾을 수 없습니다.');

    const expiresAt = new Date();
    if (dto.expiresIn === '24h') expiresAt.setHours(expiresAt.getHours() + 24);
    else expiresAt.setDate(expiresAt.getDate() + 7);

    if (dto.type === InviteType.SHARED) {
      const token = crypto.randomBytes(8).toString('hex');
      const invite = this.inviteLinkRepo.create({
        groupId,
        token,
        type: InviteType.SHARED,
        expiresAt,
      });
      await this.inviteLinkRepo.save(invite);
      return {
        url: `${process.env.FRONTEND_URL}/g/${token}`,
        expiresAt,
      };
    }

    if (!dto.members?.length) {
      throw new BadRequestException('방식 B는 members 목록이 필요합니다.');
    }

    const links = await Promise.all(
      dto.members.map(async (name) => {
        const token = crypto.randomBytes(8).toString('hex');
        const invite = this.inviteLinkRepo.create({
          groupId,
          token,
          type: InviteType.PERSONAL,
          targetName: name,
          expiresAt,
        });
        await this.inviteLinkRepo.save(invite);
        return { name, url: `${process.env.FRONTEND_URL}/u/${token}` };
      }),
    );

    return { links, expiresAt };
  }

  async getInfo(token: string) {
    const invite = await this.inviteLinkRepo.findOne({
      where: { token },
      relations: ['group'],
    });

    if (!invite) throw new NotFoundException('초대링크를 찾을 수 없습니다.');

    const isExpired = invite.expiresAt < new Date();
    const memberCount = await this.groupMemberRepo.count({
      where: { groupId: invite.groupId },
    });

    return {
      groupId: invite.groupId,
      groupName: invite.group.name,
      type: invite.type,
      targetName: invite.targetName ?? null,
      isExpired,
      memberCount,
    };
  }

  async joinViaSharedLink(token: string, user: User): Promise<void> {
    const invite = await this.inviteLinkRepo.findOne({ where: { token } });
    if (!invite) throw new NotFoundException('초대링크를 찾을 수 없습니다.');
    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('초대링크가 만료되었습니다. 새 링크를 요청해주세요.');
    }
    if (invite.type !== InviteType.SHARED) {
      throw new BadRequestException('방식 A 링크가 아닙니다.');
    }

    const already = await this.groupMemberRepo.findOne({
      where: { groupId: invite.groupId, userId: user.id },
    });
    if (already) return;

    const member = this.groupMemberRepo.create({
      groupId: invite.groupId,
      userId: user.id,
      displayName: user.nickname,
      joinedAt: new Date(),
    });
    await this.groupMemberRepo.save(member);
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanExpiredInvites(): Promise<void> {
    await this.inviteLinkRepo.delete({ expiresAt: LessThan(new Date()) });
  }
}
