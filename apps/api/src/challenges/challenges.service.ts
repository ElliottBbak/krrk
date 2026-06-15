import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ChallengeDuration,
  ChallengeStatus,
  ChallengeType,
  GameType,
} from '@krrk/shared';
import { Challenge } from './challenge.entity';
import { GroupMember } from '../groups/group-member.entity';
import { CreateChallengeDto } from './dto/create-challenge.dto';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepo: Repository<Challenge>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepo: Repository<GroupMember>,
  ) {}

  async create(groupId: string, userId: string, dto: CreateChallengeDto) {
    const member = await this.groupMemberRepo.findOne({
      where: { groupId, userId },
    });
    if (!member) throw new ForbiddenException('그룹 멤버가 아닙니다.');

    if (
      dto.gameType === GameType.BOMB &&
      dto.type === ChallengeType.WINNER_BENEFIT
    ) {
      throw new BadRequestException(
        '폭탄 게임은 꼴찌 벌칙 챌린지에서만 사용 가능합니다.',
      );
    }

    const challenge = this.challengeRepo.create({
      groupId,
      proposedBy: userId,
      ...dto,
      endsAt: this.calcEndsAt(dto.duration),
    });
    await this.challengeRepo.save(challenge);

    return this.toDto(challenge);
  }

  async findByGroup(groupId: string, status?: ChallengeStatus) {
    const where: Record<string, unknown> = { groupId };
    if (status) where['status'] = status;

    const challenges = await this.challengeRepo.find({
      where,
      order: { startsAt: 'DESC' },
    });

    return { challenges: challenges.map((c) => this.toDto(c)) };
  }

  async findActiveByGroup(groupId: string) {
    const challenges = await this.challengeRepo.find({
      where: { groupId, status: ChallengeStatus.ACTIVE },
      order: { startsAt: 'DESC' },
    });
    return challenges.map((c) => this.toDto(c));
  }

  private calcEndsAt(duration: ChallengeDuration): Date | null {
    if (duration === ChallengeDuration.SINGLE) return null;
    const now = new Date();
    const days = duration === ChallengeDuration.WEEK ? 7 : 30;
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private toDto(c: Challenge) {
    return {
      id: c.id,
      groupId: c.groupId,
      proposedBy: c.proposedBy,
      duration: c.duration,
      type: c.type,
      gameType: c.gameType,
      rewardText: c.rewardText,
      revealMode: c.revealMode,
      status: c.status,
      startsAt: c.startsAt,
      endsAt: c.endsAt,
    };
  }
}
