import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  ChallengeDuration,
  ChallengeStatus,
  ChallengeType,
  GameType,
  RevealMode,
} from '@krrk/shared';
import { Group } from '../groups/group.entity';

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  groupId: string;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column()
  proposedBy: string;

  @Column({ type: 'enum', enum: ChallengeDuration })
  duration: ChallengeDuration;

  @Column({ type: 'enum', enum: ChallengeType })
  type: ChallengeType;

  @Column({ type: 'enum', enum: GameType })
  gameType: GameType;

  @Column({ length: 200 })
  rewardText: string;

  @Column({ type: 'enum', enum: RevealMode })
  revealMode: RevealMode;

  @Column({ type: 'enum', enum: ChallengeStatus, default: ChallengeStatus.ACTIVE })
  status: ChallengeStatus;

  @CreateDateColumn()
  startsAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endsAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  revealedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
