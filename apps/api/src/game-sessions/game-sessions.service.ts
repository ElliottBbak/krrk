import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import crypto from 'crypto';
import { GameSession } from './game-session.entity';
import { GameResult } from './game-result.entity';
import { GroupMember } from '../groups/group-member.entity';

export interface RankingEntry {
  rank: number;
  id: string;
  name: string;
  color: string;
}

@Injectable()
export class GameSessionsService {
  constructor(
    @InjectRepository(GameSession)
    private readonly sessionRepo: Repository<GameSession>,
    @InjectRepository(GameResult)
    private readonly resultRepo: Repository<GameResult>,
    @InjectRepository(GroupMember)
    private readonly memberRepo: Repository<GroupMember>,
  ) {}

  async createSession(groupId: string, challengeId: string): Promise<GameSession> {
    const seed = crypto.randomBytes(16).toString('hex');
    const session = this.sessionRepo.create({
      groupId,
      challengeId,
      seed,
      status: 'WAITING',
    });
    return this.sessionRepo.save(session);
  }

  async startSession(sessionId: string): Promise<GameSession> {
    await this.sessionRepo.update(sessionId, {
      status: 'PLAYING',
      startedAt: new Date(),
    });
    return this.sessionRepo.findOneOrFail({ where: { id: sessionId } });
  }

  async saveResults(sessionId: string, rankings: RankingEntry[]): Promise<void> {
    const session = await this.sessionRepo.findOneOrFail({ where: { id: sessionId } });
    if (session.status === 'DONE') return;

    await this.sessionRepo.update(sessionId, {
      status: 'DONE',
      endedAt: new Date(),
    });

    const total = rankings.length;
    const results = rankings.map((r) =>
      this.resultRepo.create({
        sessionId,
        challengeId: session.challengeId,
        userId: r.id,
        rank: r.rank,
        isWinner: r.rank === 1,
        isLoser: r.rank === total,
        didParticipate: true,
      }),
    );
    await this.resultRepo.save(results);

    // 승패 기록 업데이트
    for (const r of rankings) {
      await this.memberRepo.update(
        { groupId: session.groupId, userId: r.id },
        {
          totalWins: () => (r.rank === 1 ? 'totalWins + 1' : 'totalWins'),
          totalLosses: () => (r.rank === total ? 'totalLosses + 1' : 'totalLosses'),
        },
      );
    }
  }

  async findSession(sessionId: string): Promise<GameSession | null> {
    return this.sessionRepo.findOne({ where: { id: sessionId } });
  }

  async findPlayingSessionByChallenge(challengeId: string): Promise<GameSession | null> {
    return this.sessionRepo.findOne({
      where: [
        { challengeId, status: 'WAITING' },
        { challengeId, status: 'PLAYING' },
      ],
    });
  }
}
